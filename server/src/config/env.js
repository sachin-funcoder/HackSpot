import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envFilePath });

const parsedPort = Number.parseInt(process.env.PORT || '5000', 10);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.isNaN(parsedPort) ? 5000 : parsedPort,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '',
  jwtSecret: process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ? process.env.JWT_EXPIRES_IN.trim() : '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME
    ? process.env.AUTH_COOKIE_NAME.trim()
    : 'hackspot_token',
};

export default env;
