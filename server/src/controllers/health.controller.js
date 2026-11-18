import { checkDatabaseHealth } from '../config/database.js';
import env from '../config/env.js';

export async function getHealthStatus(req, res, next) {
  try {
    const database = await checkDatabaseHealth();
    const isHealthy = database.connected && database.pingOk;

    return res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy
        ? 'HackSpot API and MongoDB are healthy'
        : 'HackSpot API is running, but MongoDB is unavailable',
      data: {
        service: 'hackspot-server',
        status: isHealthy ? 'ok' : 'degraded',
        environment: env.nodeEnv,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
          connected: database.connected,
          state: database.state,
          name: database.name,
          pingOk: database.pingOk,
          latencyMs: database.latencyMs,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDatabaseHealthStatus(req, res, next) {
  try {
    const database = await checkDatabaseHealth();
    const isHealthy = database.connected && database.pingOk;

    return res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'MongoDB connection is healthy' : 'MongoDB connection is unavailable',
      data: {
        connected: database.connected,
        state: database.state,
        host: database.host,
        name: database.name,
        pingOk: database.pingOk,
        latencyMs: database.latencyMs,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}
