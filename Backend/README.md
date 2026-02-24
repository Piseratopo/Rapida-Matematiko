# Rapida Matematiko Backend

A modular Node.js backend for the Rapida Matematiko math practice application with MongoDB integration.

## Project Structure

```
Backend/
├── config/
│   ├── database.js      # MongoDB connection and utilities
│   └── config.js        # Application configuration
├── middleware/
│   ├── errorHandler.js  # Error handling middleware
│   └── logger.js        # Request logging middleware
├── routes/
│   ├── questions.js      # Question-related API routes
│   └── health.js        # Health check routes
├── main.js              # Main application entry point
├── package.json         # Dependencies and scripts
├── test-api.js          # API testing script
└── .env.example         # Environment variables template
```

## Features

- **Modular Architecture**: Separated concerns into different modules
- **MongoDB Integration**: Persistent storage for questions
- **RESTful API**: Clean API design with proper HTTP methods
- **Error Handling**: Comprehensive error handling and logging
- **Socket.IO**: Real-time communication support
- **Environment Configuration**: Flexible configuration via environment variables
- **Graceful Shutdown**: Proper cleanup on server termination

## API Endpoints

### Base URL: `http://localhost:3001/api`

#### Questions
- `GET /api/questions` - Get all questions (with pagination)
- `GET /api/questions/:id` - Get a specific question by ID
- `POST /api/questions` - Save a new question
- `DELETE /api/questions/:id` - Delete a question
- `GET /api/questions/stats` - Get question statistics

#### Health
- `GET /api/health` - Health check endpoint

#### Documentation
- `GET /api` - API documentation and available endpoints

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template and configure:
```bash
cp .env.example .env
```

Edit `.env` file with your settings:
```env
PORT=3001
MONGODB_URL=mongodb://localhost:27017
DB_NAME=rapida-matematiko
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Start the Server

**Development mode (with file watching):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Testing

Test the API endpoints:
```bash
npm test
```

## Data Models

### Question
```javascript
{
  expression: {
    operands: ["5", "3", "2"],
    operators: ["+", "-"]
  },
  answer: "6",
  timestamp: "2026-02-24T12:50:00.000Z"
}
```

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors
- **409 Conflict**: Duplicate entries

All errors include detailed messages for debugging.

## Logging

Request logging with colored status codes:
- 🟢 Green: 2xx (Success)
- 🔵 Blue: 3xx (Redirection)
- 🟡 Yellow: 4xx (Client errors)
- 🔴 Red: 5xx (Server errors)

## Graceful Shutdown

The server handles graceful shutdown on:
- `SIGINT` (Ctrl+C)
- `SIGTERM` (Process termination)
- Uncaught exceptions
- Unhandled promise rejections

## Socket.IO Events

- `join-room` - Join a specific room
- `leave-room` - Leave a specific room
- `connection` - Client connected
- `disconnect` - Client disconnected

## Development

The modular structure allows for easy extension:

1. **Adding new routes**: Create new files in `routes/` directory
2. **Adding middleware**: Create new files in `middleware/` directory
3. **Configuration**: Update `config/config.js` for new settings
4. **Database operations**: Use the database singleton from `config/database.js`

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a proper MongoDB connection string
3. Configure CORS origin appropriately
4. Set up proper logging and monitoring
5. Use a process manager like PM2

## License

ISC
