import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import config from './config/config.js';
import database from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Import routes
import { 
   saveQuestion, 
   getQuestions, 
   getQuestionById, 
   deleteQuestion, 
   getQuestionStats 
} from './routes/questions.js';
import { healthCheck } from './routes/health.js';

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
   cors: config.cors
});

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
const apiPrefix = config.api.prefix;

// Health check endpoint
app.get(`${apiPrefix}/health`, healthCheck);

// Question routes
app.post(`${apiPrefix}/questions`, saveQuestion);
app.get(`${apiPrefix}/questions`, getQuestions);
app.get(`${apiPrefix}/questions/:id`, getQuestionById);
app.delete(`${apiPrefix}/questions/:id`, deleteQuestion);
app.get(`${apiPrefix}/questions/stats`, getQuestionStats);

// API info endpoint
app.get(`${apiPrefix}`, (req, res) => {
   res.json({
      name: 'Rapida Matematiko API',
      version: config.api.version,
      endpoints: {
         health: 'GET /api/health',
         questions: {
         getAll: 'GET /api/questions',
         getById: 'GET /api/questions/:id',
         create: 'POST /api/questions',
         delete: 'DELETE /api/questions/:id',
         stats: 'GET /api/questions/stats'
         }
      }
   });
});

// Root endpoint
app.get('/', (req, res) => {
   res.json({
      message: 'Rapida Matematiko Backend Server',
      status: 'Running',
      docs: `${apiPrefix}`
   });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
   console.log(`Client connected: ${socket.id}`);
   
   // Handle custom events
   socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
   });
   
   socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`Client ${socket.id} left room: ${room}`);
   });
   
   socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
   });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
   console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
   
   try {
      // Close HTTP server
      server.close(() => {
         console.log('HTTP server closed');
      });
      
      // Close database connection
      await database.disconnect();
      
      console.log('Graceful shutdown completed');
      process.exit(0);
   } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
   }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
   try {
      // Connect to database
      await database.connect(config.mongodb.url);
      
      // Start HTTP server
      server.listen(config.port, () => {
         console.log(`🚀 Server running on port ${config.port}`);
         console.log(`📚 API documentation: http://localhost:${config.port}${apiPrefix}`);
         console.log(`🏥 Health check: http://localhost:${config.port}${apiPrefix}/health`);
         console.log(`🔌 Socket.IO server ready`);
      });
   } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
   }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
   console.error('Uncaught Exception:', error);
   gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
   gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();