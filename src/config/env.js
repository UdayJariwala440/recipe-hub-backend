import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 3023,

  mongoUri: process.env.MONGO_URI,

  clientUrl: process.env.CLIENT_URL,
};

if (!env.mongoUri) {
  throw new Error('MONGO_URI is not configured');
}

export default env;