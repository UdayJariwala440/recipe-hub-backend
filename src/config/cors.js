import cors from 'cors';
import env from './env.js';

const corsOptions = {
  origin: env.clientUrl,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],

  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;