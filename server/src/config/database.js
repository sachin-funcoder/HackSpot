import mongoose from 'mongoose';
import env from './env.js';

const READY_STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersRegistered = false;

function registerConnectionListeners() {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('connected', () => {
    const { host, name } = mongoose.connection;
    console.log(`[MongoDB] Connected successfully (host: ${host}, database: ${name})`);
  });

  mongoose.connection.on('error', (error) => {
    console.error(`[MongoDB] Connection error: ${error.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected successfully.');
  });

  listenersRegistered = true;
}

export function getDatabaseStatus() {
  const readyState = mongoose.connection.readyState;

  return {
    connected: readyState === 1,
    state: READY_STATE_LABELS[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

export async function checkDatabaseHealth() {
  const status = getDatabaseStatus();

  if (!status.connected || !mongoose.connection.db) {
    return {
      ...status,
      pingOk: false,
      latencyMs: null,
    };
  }

  const startTime = Date.now();

  try {
    await mongoose.connection.db.admin().ping();
    return {
      ...status,
      pingOk: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      ...status,
      connected: false,
      pingOk: false,
      latencyMs: Date.now() - startTime,
      error: error.message,
    };
  }
}

export async function connectDatabase(uri = env.mongoUri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Please set MONGODB_URI in server/.env.');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }

  registerConnectionListeners();

  console.log('[MongoDB] Connecting to database...');

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    return connection;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    throw error;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log('[MongoDB] Connection closed cleanly.');
}
