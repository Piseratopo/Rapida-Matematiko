import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
   // Server configuration
   port: process.env.PORT || 3001,
   
   // Database configuration
   mongodb: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      dbName: process.env.DB_NAME || 'rapida-matematiko',
      collectionName: process.env.COLLECTION_NAME || 'savedQuestions'
   },
   
   // CORS configuration
   cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
   },
   
   // API configuration
   api: {
      prefix: '/api',
      version: 'v1'
   }
};

export default config;
