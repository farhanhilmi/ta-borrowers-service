import dotenv from 'dotenv';

// dotenv.config({
//     path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
//   });

dotenv.config();

const { APP_NAME, MONGODB_URI, PORT, RABBITMQ_URL, EXCHANGE_NAME } =
    process.env;

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
        },
        EXCHANGE_NAME,
    },
};

export default config;
