import { MongoClient, ObjectId } from 'mongodb';

class Database {
   constructor() {
      this.client = null;
      this.db = null;
      this.questionsCollection = null;
   }

   async connect(url = process.env.MONGODB_URL || 'mongodb://localhost:27017') {
      try {
         this.client = new MongoClient(url);
         await this.client.connect();
         console.log('Connected to MongoDB');
         
         this.db = this.client.db('rapida-matematiko');
         this.questionsCollection = this.db.collection('savedQuestions');
         
         // Create indexes for better query performance
         await this.questionsCollection.createIndex({ timestamp: -1 });
         
         return this.db;
      } catch (error) {
         console.error('MongoDB connection error:', error);
         throw error;
      }
   }

   async disconnect() {
      if (this.client) {
         await this.client.close();
         console.log('Disconnected from MongoDB');
      }
   }

   getQuestionsCollection() {
      if (!this.questionsCollection) {
         throw new Error('Database not connected. Call connect() first.');
      }
      return this.questionsCollection;
   }

   getDb() {
      if (!this.db) {
         throw new Error('Database not connected. Call connect() first.');
      }
      return this.db;
   }

   // Instance method to format document
   formatDocument(doc) {
      if (doc && doc._id) {
         return {
         ...doc,
         _id: doc._id.toString()
         };
      }
      return doc;
   }

   // Instance method to create ObjectId
   createObjectId(id) {
      return new ObjectId(id);
   }
}

// Create and export singleton instance
const database = new Database();
export default database;
