import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing with credentials enabled for HTTP-only cookies
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// HTTP request logging
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Parse cookies and request bodies with sensible payload limits
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// 404 and global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
