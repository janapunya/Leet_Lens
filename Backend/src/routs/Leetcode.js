const express = require('express')
const router = express.Router()
const Leetcode_Userdata = require('../Controller/Leetcode.controller')
router.get("/user/:username",Leetcode_Userdata.userNameData)
router.post("/verify_jwt",Leetcode_Userdata.checkjwt)
router.post('/solvedData',Leetcode_Userdata.solvedQuestion)
module.exports= router