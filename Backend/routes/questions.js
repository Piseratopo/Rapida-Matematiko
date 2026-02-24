import database from '../config/database.js';

export const saveQuestion = async (req, res) => {
   try {
      const { expression, answer, isCorrect, timeUp } = req.body;
      
      // Validation
      if (!expression || !answer) {
         return res.status(400).json({ 
         error: 'Expression and answer are required',
         details: {
            expression: !!expression,
            answer: !!answer
         }
         });
      }

      // Validate expression structure
      if (!expression.operands || !expression.operators) {
         return res.status(400).json({ 
         error: 'Expression must contain operands and operators arrays' 
         });
      }

      const questionData = {
         expression,
         answer,
         isCorrect: isCorrect !== undefined ? isCorrect : null,
         timeUp: timeUp !== undefined ? timeUp : null,
         timestamp: new Date()
      };

      const collection = database.getQuestionsCollection();
      const result = await collection.insertOne(questionData);
      
      const savedQuestion = database.formatDocument({
         ...questionData,
         _id: result.insertedId
      });
      
      res.status(201).json({
         success: true,
         questionId: result.insertedId.toString(),
         question: savedQuestion
      });
   } catch (error) {
      console.error('Error saving question:', error);
      res.status(500).json({ 
         error: 'Failed to save question',
         details: error.message 
      });
   }
};

export const getQuestions = async (req, res) => {
   try {
      const { limit = 50, skip = 0 } = req.query;
      
      const collection = database.getQuestionsCollection();
      const questions = await collection
         .find({})
         .sort({ timestamp: -1 })
         .limit(parseInt(limit))
         .skip(parseInt(skip))
         .toArray();
      
      const formattedQuestions = questions.map(database.formatDocument);
      
      res.json({
         success: true,
         questions: formattedQuestions,
         count: formattedQuestions.length,
         pagination: {
         limit: parseInt(limit),
         skip: parseInt(skip)
         }
      });
   } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ 
         error: 'Failed to fetch questions',
         details: error.message 
      });
   }
};

export const getQuestionById = async (req, res) => {
   try {
      const { id } = req.params;
      
      const collection = database.getQuestionsCollection();
      const question = await collection.findOne({ 
         _id: database.constructor.createObjectId(id) 
      });
      
      if (!question) {
         return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json({
         success: true,
         question: database.formatDocument(question)
      });
   } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ 
         error: 'Failed to fetch question',
         details: error.message 
      });
   }
};

export const deleteQuestion = async (req, res) => {
   try {
      const { id } = req.params;
      
      const collection = database.getQuestionsCollection();
      const result = await collection.deleteOne({ 
         _id: database.constructor.createObjectId(id) 
      });
      
      if (result.deletedCount === 0) {
         return res.status(404).json({ error: 'Question not found' });
      }
      
      res.json({ 
         success: true, 
         message: 'Question deleted successfully',
         deletedCount: result.deletedCount
      });
   } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ 
         error: 'Failed to delete question',
         details: error.message 
      });
   }
};

export const getQuestionStats = async (req, res) => {
   try {
      const collection = database.getQuestionsCollection();
      
      const stats = await collection.aggregate([
         {
         $group: {
            _id: null,
            totalQuestions: { $sum: 1 },
            avgOperands: { $avg: { $size: '$expression.operands' } },
            avgOperators: { $avg: { $size: '$expression.operators' } },
            oldestQuestion: { $min: '$timestamp' },
            newestQuestion: { $max: '$timestamp' }
         }
         }
      ]).toArray();
      
      res.json({
         success: true,
         stats: stats[0] || {
         totalQuestions: 0,
         avgOperands: 0,
         avgOperators: 0,
         oldestQuestion: null,
         newestQuestion: null
         }
      });
   } catch (error) {
      console.error('Error fetching question stats:', error);
      res.status(500).json({ 
         error: 'Failed to fetch question stats',
         details: error.message 
      });
   }
};
