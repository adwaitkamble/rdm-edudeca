import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
  const configuredUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edudeca';

  mongoose.set('strictQuery', true);

  // 1. Try connecting to configured MongoDB (e.g. if local service or Atlas URI is provided)
  try {
    await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: 1500,
      autoIndex: true,
    });
    // eslint-disable-next-line no-console
    console.log(`[Database] MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return;
  } catch (_err) {
    // eslint-disable-next-line no-console
    console.log('[Database] Local MongoDB service not active on port 27017. Initializing embedded local MongoDB...');
  }

  // 2. Fallback: Automatically start an embedded local MongoDB instance
  try {
    const cacheDir = path.resolve(__dirname, '../../../../node_modules/.cache/mongodb-memory-server');
    process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;

    const cachedBinaryPath = path.join(cacheDir, 'mongod-x64-win32-7.0.24.exe');
    if (fs.existsSync(cachedBinaryPath)) {
      process.env.MONGOMS_SYSTEM_BINARY = cachedBinaryPath;
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'edudeca',
      },
    });
    const memoryUri = mongoMemoryServer.getUri();

    await mongoose.connect(memoryUri, {
      dbName: 'edudeca',
      autoIndex: true,
    });

    // eslint-disable-next-line no-console
    console.log(`\n🎉 [Database] Embedded Local MongoDB connected successfully!`);
    // eslint-disable-next-line no-console
    console.log(`   Database URL: ${memoryUri}\n`);
  } catch (memError) {
    // eslint-disable-next-line no-console
    console.error('[Database] Failed to start embedded MongoDB:', memError);
  }

  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[Database] MongoDB connection disconnected.');
  });
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Database] Error closing MongoDB connection:', err);
  }
};
