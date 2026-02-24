// Simple test script to verify API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
   console.log('Testing API endpoints...');
   
   try {
      // Test health endpoint
      console.log('\n1. Testing health endpoint...');
      const healthResponse = await fetch(`${API_BASE}/health`);
      const healthData = await healthResponse.json();
      console.log('Health check:', healthData);
      
      // Test saving a question
      console.log('\n2. Testing save question endpoint...');
      const testQuestion = {
         expression: {
         operands: ["5", "3", "2"],
         operators: ["+", "-"]
         },
         answer: "6"
      };
      
      const saveResponse = await fetch(`${API_BASE}/questions`, {
         method: 'POST',
         headers: {
         'Content-Type': 'application/json',
         },
         body: JSON.stringify(testQuestion)
      });
      
      const saveData = await saveResponse.json();
      console.log('Save question response:', saveData);
      
      // Test getting all questions
      console.log('\n3. Testing get questions endpoint...');
      const getResponse = await fetch(`${API_BASE}/questions`);
      const getData = await getResponse.json();
      console.log('Get questions response:', getData);
      
      console.log('\n✅ All API tests completed successfully!');
      
   } catch (error) {
      console.error('❌ API test failed:', error.message);
   }
}

testAPI();
