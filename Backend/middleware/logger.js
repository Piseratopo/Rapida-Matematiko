export const requestLogger = (req, res, next) => {
   const timestamp = new Date().toISOString();
   const method = req.method;
   const url = req.originalUrl;
   const ip = req.ip || req.connection.remoteAddress;
   
   console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
   
   // Log response when it's finished
   res.on('finish', () => {
      const statusCode = res.statusCode;
      const statusColor = getStatusColor(statusCode);
      console.log(`[${timestamp}] ${method} ${url} - ${statusColor}${statusCode}\x1b[0m`);
   });
   
   next();
};

function getStatusColor(statusCode) {
   if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green
   if (statusCode >= 300 && statusCode < 400) return '\x1b[34m'; // Blue
   if (statusCode >= 400 && statusCode < 500) return '\x1b[33m'; // Yellow
   if (statusCode >= 500) return '\x1b[31m'; // Red
   return '\x1b[0m'; // Default
}
