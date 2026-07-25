const Question = require("../models/Question.model");
const userDataModel = require("../models/UserData.model");
const jwt = require("jsonwebtoken");

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTestCases(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((tc) => tc && String(tc.input).trim() !== "" && String(tc.output).trim() !== "")
    .map((tc) => ({
      input: String(tc.input),
      output: String(tc.output),
    }));
}

function normalizeTags(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const t of arr) {
    const v = String(t ?? "")
      .trim()
      .toLowerCase();
    if (!v) continue;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

async function listQuestions(_req, res) {
  try {
    const items = await Question.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list questions" });
  }
}

async function getQuestion(req, res) {
  try {
    const doc = await Question.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Question not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to load question" });
  }
}

async function createQuestion(req, res) {
  try {
    const body = req.body || {};
    const slug =
      body.slug && String(body.slug).trim()
        ? slugify(body.slug)
        : slugify(body.title || "question");

    let finalSlug = slug;
    let n = 0;
    while (await Question.exists({ slug: finalSlug })) {
      n += 1;
      finalSlug = `${slug}-${n}`;
    }

    const doc = await Question.create({
      title: body.title,
      slug: finalSlug,
      description: body.description,
      difficulty: body.difficulty,
      functionName: body.functionName,
      functionSignature: body.functionSignature,
      tags: normalizeTags(body.tags),
      starterCode: {
        javascript: body.starterCode?.javascript ?? "",
        python: body.starterCode?.python ?? "",
        java: body.starterCode?.java ?? "",
      },
      sampleTestCases: normalizeTestCases(body.sampleTestCases),
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate slug" });
    }
    res.status(400).json({ error: err.message || "Failed to create question" });
  }
}

async function updateQuestion(req, res) {
  try {
    const body = req.body || {};
    const update = {};

    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.difficulty !== undefined) update.difficulty = body.difficulty;
    if (body.functionName !== undefined) update.functionName = body.functionName;
    if (body.functionSignature !== undefined) update.functionSignature = body.functionSignature;
    if (body.tags !== undefined) update.tags = normalizeTags(body.tags);

    if (body.starterCode !== undefined) {
      update.starterCode = {
        javascript: body.starterCode?.javascript ?? "",
        python: body.starterCode?.python ?? "",
        java: body.starterCode?.java ?? "",
      };
    }

    if (body.sampleTestCases !== undefined) {
      update.sampleTestCases = normalizeTestCases(body.sampleTestCases);
    }

    if (body.slug && String(body.slug).trim()) {
      update.slug = slugify(body.slug);
    }

    const doc = await Question.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: "Question not found" });
    res.json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate slug" });
    }
    res.status(400).json({ error: err.message || "Failed to update question" });
  }
}

async function deleteQuestion(req, res) {
  try {
    const doc = await Question.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Question not found" });
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete question" });
  }
}


async function userQuestionData(req, res) {
  try{
    const { id } = req.body;
    const {user_cookie} = req.cookies;
    if(!user_cookie) return res.status(401).json({ status: false, error: "Unauthorized" });

    const user = jwt.verify(user_cookie, process.env.JWT_SECRET);
    if(!user) return res.status(401).json({ status: false, error: "Unauthorized" });
    console.log(user) 
    const userData = await userDataModel.findOne({ leetcodeUsername: user });
    if(!userData) return res.json({ status: false, error: "User not found" });

    if (!id) return res.json({ status: false, error: "Question id missing" });

    const solvedQuestion = Array.isArray(userData.solvedQuestions)
      ? userData.solvedQuestions.find((q) => String(q.questionId) === String(id))
      : null;

    if(!solvedQuestion) return res.json({ status: false, error: "Question not found" });
    res.json({ status: true, question: solvedQuestion });
  }catch(err){
    res.status(500).json({ status: false, error: err.message || "Failed to get question data" });
  }
}

module.exports = {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  userQuestionData,
};
