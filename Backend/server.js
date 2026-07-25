require('dotenv').config();
const app = require('./src/App');
const connectDB = require('./src/db/Connectiondb');
const redis = require('./src/services/radis')
redis.connect();
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});