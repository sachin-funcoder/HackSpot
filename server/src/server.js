import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import env from './config/env.js';

let server = null;
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          console.log('HTTP server closed.');
          return resolve();
        });
      });
    }

    await disconnectDatabase();
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    console.error(`Error during graceful shutdown: ${error.message}`);
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

async function startServer() {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is not defined. Please set JWT_SECRET in server/.env.');
    }

    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(
        `HackSpot API server running in ${env.nodeEnv} mode on http://localhost:${env.port}`,
      );
    });

    server.on('error', async (error) => {
      console.error(`HTTP server error: ${error.message}`);
      await disconnectDatabase();
      process.exit(1);
    });
  } catch (error) {
    console.error(
      `Failed to start HackSpot API server because MongoDB connection failed: ${error.message}`,
    );
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
