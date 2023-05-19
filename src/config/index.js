import dotenv from 'dotenv';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = `${process.env.NODE_ENV}.env`;

console.log('process.env.NODE_ENV', env);
dotenv.config({
    path: join(__dirname, `../../${process.env.NODE_ENV}.env`),
});

const {
    APP_NAME,
    MONGODB_URI,
    PORT,
    RABBITMQ_URL,
    EXCHANGE_NAME,
    REDIS_SERVER,
} = process.env;

const config = {
    app: {
        port: PORT,
        // host: HOST,
        name: APP_NAME,
    },
    db: {
        uri: MONGODB_URI,
    },
    RABBITMQ: {
        URL: RABBITMQ_URL,
        CHANNEL: {
            BORROWER_SERVICE: 'borrower_service',
            AUTH_SERVICE: 'auth_service',
            LOAN: 'loans',
        },
        EXCHANGE_NAME,
    },
    REDIS_SERVER,
};

export default config;
