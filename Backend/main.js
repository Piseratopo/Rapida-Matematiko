import express from "express";   
import mongoose from "mongoose";   
import cors from "cors";   
import dotenv from "dotenv";   
dotenv.config({ path: "./.env" });   
   
import dns from "node:dns/promises";   
dns.setServers(["1.1.1.1", "1.0.0.1"]);   

const app = express();   

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://rapida-matematiko.vercel.app', 'https://rapida-matematiko.vercel.app/saved']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());   

const MONGO = process.env.MONGODB_URL;   
const PORT = process.env.PORT || 3001;

// Question Schema
const questionSchema = new mongoose.Schema({
   expression: {
      operands: [String],
      operators: [String]
   },
   answer: String,
   isCorrect: Boolean,
   timeUp: Boolean,
   timeAllowed: Number, // Time allowed for this question in seconds
   timeTaken: Number, // Time taken by user in seconds
   solvedAt: Date // When the question was solved
}, {
   timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

// Database connection
mongoose   
   .connect(MONGO)  
   .then(() => {  
   console.log("Database Successfully connected");  
})  
.catch((error) => {  
   console.error(`MongoDb Connection failed : ${error}`);    
});  

// API Routes
// Save a question
app.post('/api/questions', async (req, res) => {
   try {
      const { expression, answer, isCorrect, timeUp } = req.body;
      
      const question = new Question({
         expression,
         answer,
         isCorrect,
         timeUp
      });
      
      const savedQuestion = await question.save();
      res.status(201).json(savedQuestion);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get question by ID
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete question
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.listen(PORT, () => {   
   console.log(`Server started on port Number : ${PORT}`);   
});
