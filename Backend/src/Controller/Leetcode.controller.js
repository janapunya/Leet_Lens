const userDataModel = require('../models/UserData.model');
const redis = require('../services/radis')
const jwt = require('jsonwebtoken');
async function userNameData(req,res) {
  res.set({
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
    "Expires": "0",
  });
    const { username } = req.params;
    try {
      const cached = await redis.get(username);
      if (cached) {
        const data = JSON.parse(cached)
        const user_cookie=jwt.sign(data.username, process.env.JWT_SECRET)
        res.cookie("user_cookie", user_cookie, {
          httpOnly: true,
          secure: true, // only HTTPS
          maxAge:18000000  // 5 hours
      });
        return res.json(JSON.parse(cached));
      }
      const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
        reputation
      }
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
                profile {
                  ranking
                }
              }
            }
          `,
          variables: { username },
        }),
      });

      const data = await response.json();

      const matchedUser = data?.data?.matchedUser ?? null;


      if (response.ok && matchedUser?.username) {
        const existingUser = await userDataModel.findOne({
          leetcodeUsername: matchedUser.username,
        });

        if (!existingUser) {
          await userDataModel.create({
            leetcodeUsername: matchedUser.username,
          });
        }
        await redis.set(
          matchedUser.username,
          JSON.stringify(matchedUser),
          { EX: 86400, NX: true }
        );
      }
      const user_cookie=jwt.sign(matchedUser.username, process.env.JWT_SECRET)
        res.cookie("user_cookie", user_cookie, {
          httpOnly: true,
          secure: true, // only HTTPS
          sameSite: "none",
          path: "/",
          maxAge:18000000  // 5 hours
      });
      return res.json(matchedUser);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
}

async function checkjwt(req,res) {
  const {user_cookie} = req.cookies;

  try{
    const check_user = jwt.verify(user_cookie,process.env.JWT_SECRET);
    if(!check_user){
      return res.json({
        status:false
      })
    }
    const cached = await redis.get(check_user);
      if (cached) {
        const data = JSON.parse(cached)
    return res.json(data);
      }
      return res.json({
        status:false
      })
  }catch(err){
    return res.json({
      status:false
    })
  }
}

async function solvedQuestion(req,res) {
  try{
    console.log("Headers:", req.headers);
    console.log("Cookie Header:", req.headers.cookie);
    console.log("Cookies:", req.cookies);
    const {user_cookie} = req.cookies;

      const check_user = jwt.verify(user_cookie,process.env.JWT_SECRET);
      if(!check_user){
        return res.json({
          status:false
        })
      }
  
      const userdata = await userDataModel.findOne({leetcodeUsername: check_user}).select("solvedQuestions -_id");
      if(!userdata){
        return res.json({
          status:false
        })
      }
      return res.json({
        status:true,
        solvedQuestions:userdata.solvedQuestions
      })

}
catch(err){
  return res.status(500).json({
    status: false,
    message: err.message,
  });
}
}

module.exports ={
    userNameData,
    checkjwt,
    solvedQuestion
}