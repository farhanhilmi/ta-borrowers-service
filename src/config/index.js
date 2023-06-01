import dotenv from 'dotenv';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV;
const env = `${NODE_ENV}.env`;
console.log('current env:', env);

// const checkEnv = (ENV) => {
//     if (ENV === 'test') {
//         return '../../development.env';
//     } else {
//         return dirname(fileURLToPath(import.meta.url));
//     }
// };

// dotenv.config({
//     path: join(checkEnv(NODE_ENV), `../../${env}`),
// })

// if (NODE_ENV === 'test') {
//     dotenv.config({
//         path: join('../../development.env'),
//     });
// } else {
const basedir = path.resolve(process.cwd());
// const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({
    path: join(basedir, `${NODE_ENV}.env`),
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
