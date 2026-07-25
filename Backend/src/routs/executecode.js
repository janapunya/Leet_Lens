const express = require('express')
const router = express.Router()
const code = require('../Controller/code.controller')
const feed = require('../Controller/feed.controller')
const authcontroller = require('../middlewares/authcontroler')

router.post('/executecode',code.runcode)

router.post('/sharefeed',authcontroller.authcontroller,feed.sharefeed)
router.get('/getfeed',feed.getfeed)

module.exports= router