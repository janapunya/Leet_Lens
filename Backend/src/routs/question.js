const express = require("express");
const router = express.Router();
const q = require("../Controller/question.controller");

router.get("/", q.listQuestions);
router.get("/:id", q.getQuestion);
router.post("/", q.createQuestion);
router.put("/:id", q.updateQuestion);
router.delete("/:id", q.deleteQuestion);
router.post("/data", q.userQuestionData);

module.exports = router;
