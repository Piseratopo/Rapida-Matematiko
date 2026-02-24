export const errorHandler = (error, req, res, next) => {
   console.error('Error occurred:', error);

   // Mongoose validation error
   if (error.name === 'ValidationError') {
      return res.status(400).json({
         error: 'Validation Error',
         details: Object.values(error.errors).map(err => err.message)
      });
   }

   // MongoDB duplicate key error
   if (error.code === 11000) {
      return res.status(409).json({
         error: 'Duplicate Entry',
         details: 'A document with this value already exists'
      });
   }

   // MongoDB cast error (invalid ObjectId)
   if (error.name === 'CastError') {
      return res.status(400).json({
         error: 'Invalid ID',
         details: 'The provided ID is not valid'
      });
   }

   // Default error
   res.status(error.status || 500).json({
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
   });
};

export const notFoundHandler = (req, res) => {
   res.status(404).json({
      error: 'Not Found',
      details: `Route ${req.originalUrl} not found`
   });
};
