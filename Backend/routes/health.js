import database from '../config/database.js';

export const healthCheck = (req, res) => {
   try {
      const dbStatus = database.getDb() ? 'connected' : 'disconnected';
      
      res.json({ 
         status: 'OK', 
         message: 'Rapida Matematiko Backend is running',
         timestamp: new Date().toISOString(),
         mongodb: dbStatus,
         uptime: process.uptime(),
         memory: process.memoryUsage(),
         version: process.version
      });
   } catch (error) {
      res.status(500).json({
         status: 'ERROR',
         message: 'Health check failed',
         error: error.message
      });
   }
};
