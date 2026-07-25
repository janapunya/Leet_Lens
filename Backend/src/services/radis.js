const {createClient} = require('redis')


const client = createClient({
    username: 'default',
    password: process.env.REDIS_ID,
    socket: {
        host: 'digestion-metal-attraction-54752.db.redis.io',
        port: 17131
    }
});

client.on('error', err => console.log('Redis Client Error', err));



module.exports = client




