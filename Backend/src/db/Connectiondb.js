const mongoose = require('mongoose')

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connect to mongoDB")
    }catch(err){
        console.log("connection faild"+err); 
    }
}
module.exports =connectDB;