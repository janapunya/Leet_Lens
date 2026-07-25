const user_data = require('../models/UserData.model')
const jwt = require('jsonwebtoken');

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
};




async function runcode(req, res) {
  try {
    const { language, code, question, stdin = '' } = req.body;
    const { user_cookie } = req.cookies;

    if (!language || !code || !question || !user_cookie) {
      return res.json({
        status: false,
        error: 'request not correct'
      })
    }
    const cookie_verify = jwt.verify(user_cookie, process.env.JWT_SECRET)
    if (!cookie_verify) {
      return res.json({
        status: false,
        error: "unauthrize cookies"
      })
    }
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}`
      });
    }

    const finalcode = (index) => {
      const tc = question.sampleTestCases[index];
      return `
          ${tc.input.split(", ").map((line) => `const ${line}`).join("\n")}\n\n
          ${code}\n\n
          console.log(${question.functionSignature})
          `;
    };

    const response = async (fcode) => {

      const data = await fetch("https://ce.judge0.com/submissions/?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: fcode,
            language_id: languageId,
            stdin: stdin,
          }),
        }
      );
      return await data.json();
    }

    let errors = ''
    let results = []
    try {
      for (const [index] of question.sampleTestCases.entries()) {
        const result = finalcode(index);
        const res = await response(result);
        results.push(res.stdout ?? "")
        errors = (res.stderr ?? "")
      }
    } catch (err) {
      return res.json({
        status: false,
        error:errors
      })
    }

    for (const [index, element] of results.entries()) {
      if (
        question.sampleTestCases[index].output.replace(/\s/g, "") !==
        element.replace(/\s/g, "")
      ) {
        return res.json({
          status: false,
          error: "testing failed",
        });
      }
    }
    
    await user_data.findOneAndUpdate({ leetcodeUsername: cookie_verify },{
      $push:{
        solvedQuestions:{
            questionId: question._id,
            questionTitle: question.title,
            questionType: question.questionType,
            tags: question.tags,
            difficulty: question.difficulty,
            answer: {
              language,
              code,
            },
        }
      }
    }, { returnDocument: 'after' })


    return res.json({
      status: true
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      status: false,
      error: "Server Error",
    });
  }
}

module.exports = {
  runcode
}