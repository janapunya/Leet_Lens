const mongoose = require("mongoose");

const solvedQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    questionTitle: {
      type: String,
      required: true,
      trim: true,
    },

    questionType: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    isSolved: {
      type: Boolean,
      default: true,
    },

    answer:{
      language:{
        type:String,
        required:true
      },
      code:{
        type:String,
        required:true
      }
    }

  },
  { timestamps: true}
);

const userDataSchema = new mongoose.Schema(
  {
    leetcodeUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    solvedQuestions: [solvedQuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserData", userDataSchema);
