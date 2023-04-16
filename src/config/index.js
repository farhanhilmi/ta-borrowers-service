import dotenv from 'dotenv';

// dotenv.config({
//     path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
//   });

dotenv.config();

const { APP_NAME, MONGODB_URI, PORT } = process.env;

const config = {
    app: {
        port: PORT,
        // host: HOST,
        name: APP_NAME,
    },
    db: {
        uri: MONGODB_URI,
    },
};

export default config;
