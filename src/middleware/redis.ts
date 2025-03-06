import { createClient } from 'redis';
import { variables } from '../constants';

const client = createClient({
    username: 'default',
    password: variables.redisPass,
    socket: {
        host: 'redis-15287.c62.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 15287
    }
});

client.on('error', err => console.log('Redis Client Error', err));


(async()=>{
    if(!client.isOpen){
        await client.connect();
        console.log('Connected to Redis')
    }
})();


export default client;