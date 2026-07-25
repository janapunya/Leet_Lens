const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  slug: {
    type: String,
    unique: true,
    sparse: true,
  },

  description: {
    type: String,
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },

  functionName: {
    type: String,
    required: true,
  },

  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],

  functionSignature: {
    type: String,
    required: true,
  },

  starterCode: {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
  },

  sampleTestCases: [testCaseSchema],
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
