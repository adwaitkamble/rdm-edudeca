import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { apiRoutes } from './routes';
import { webhookRoutes } from './routes/webhook.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-user-id',
      'svix-id',
      'svix-timestamp',
      'svix-signature',
    ],
  })
);

// 1. Mount Clerk Webhook route with express.raw() BEFORE global express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// 2. Global JSON Body Parser for all other REST routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'edudeca-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Main API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('[API Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server and Connect Database
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 EduDeca REST API Server is running on http://0.0.0.0:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`📡 Healthcheck: http://localhost:${PORT}/health`);
      // eslint-disable-next-line no-console
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
    });

    // Graceful Shutdown
    const handleShutdown = () => {
      // eslint-disable-next-line no-console
      console.log('Received termination signal. Closing server gracefully...');
      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
