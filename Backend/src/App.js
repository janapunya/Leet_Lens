const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Leetcode_Data = require('./routs/Leetcode');
const questionRoutes = require('./routs/question');
const executecode = require('./routs/executecode')
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));
app.use('/LeetCode',Leetcode_Data);
app.use('/api/questions', questionRoutes);
app.use('/execute',executecode)

module.exports = app;