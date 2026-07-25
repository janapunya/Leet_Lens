const mongoose = require('mongoose');
const { Schema } = mongoose;

const dataSchema = new mongoose.Schema({
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
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
    });

const feedSchema = new mongoose.Schema({
    username: {
        type: Schema.Types.String,
        ref: 'User',
        required: true,
    },
    
    sharedData: [dataSchema],
}, { timestamps: true });

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;