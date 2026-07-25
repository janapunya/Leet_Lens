const feedModel = require('../models/Feed.model');
const userModel = require('../models/UserData.model');
const { solvedQuestion } = require('./Leetcode.controller');
async function sharefeed(req,res) {
    try {
    const { questionId, title, difficulty, description, language, code } = req.body;
    const user = req.user;

    const userdata = await userModel.findOne({
        leetcodeUsername: user
    });
    if (!userdata) {
        return res.status(404).json({ message: 'User not found' });
    }
 
    const feed = new feedModel({ 
        username: user,
        sharedData: {
            questionId: questionId,
            title: title,
            difficulty: difficulty,
            description: description,
            answer: {
                language: language,
                code: code
            }
        }
     });
    await feed.save();
    res.status(200).json({ message: 'Feed shared successfully' });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getfeed(req,res) {
    try {
        const feed = await feedModel.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(feed);
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = { sharefeed, getfeed }