import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import authRoutes from './routes/auth.routes';
import reviewRoutes from './routes/review.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const app = express();

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4200'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Code Review Backend Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
});

// let server: any;

// if (require.main === module) {
//   server = app.listen(PORT, () => {
//     console.log(`🚀 Code Review Backend Server running on port ${PORT}`);
//     console.log(`📊 Health check available at http://localhost:${PORT}/health`);
//     console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🔒 CORS origins: ${allowedOrigins.join(', ')}`);
//   });

//   // Graceful shutdown handlers
//   const gracefulShutdown = (signal: string) => {
//     console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

//     if (server) {
//       server.close(() => {
//         console.log('✅ HTTP server closed.');
//         console.log('👋 Graceful shutdown completed.');
//         process.exit(0);
//       });

//       // Force close after 10 seconds
//       setTimeout(() => {
//         console.error(
//           '❌ Could not close connections in time, forcefully shutting down'
//         );
//         process.exit(1);
//       }, 10000);
//     } else {
//       process.exit(0);
//     }
//   };

//   // Listen for shutdown signals
//   process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//   process.on('SIGINT', () => gracefulShutdown('SIGINT'));

//   // Handle uncaught exceptions
//   process.on('uncaughtException', (error: Error) => {
//     console.error('❌ Uncaught Exception:', error);
//     gracefulShutdown('uncaughtException');
//   });

//   // Handle unhandled promise rejections
//   process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
//     console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//     gracefulShutdown('unhandledRejection');
//   });
// }

export default app;
