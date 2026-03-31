// Simple API test
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  try {
    console.log('Testing API...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint:');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('Health:', health);
    
    // Test POST question
    console.log('\n2. Testing POST question:');
    const testQuestion = {
      expression: {
        operands: ['5', '3'],
        operators: ['+']
      },
      answer: '8',
      isCorrect: true,
      timeUp: false
    };
    
    const postResponse = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testQuestion)
    });
    
    if (postResponse.ok) {
      const savedQuestion = await postResponse.json();
      console.log('Saved question:', savedQuestion);
      
      // Test GET all questions
      console.log('\n3. Testing GET all questions:');
      const getResponse = await fetch(`${API_URL}/questions`);
      const questions = await getResponse.json();
      console.log('All questions:', questions);
      
      // Test GET single question
      if (questions.length > 0) {
        console.log('\n4. Testing GET single question:');
        const singleResponse = await fetch(`${API_URL}/questions/${savedQuestion._id}`);
        const singleQuestion = await singleResponse.json();
        console.log('Single question:', singleQuestion);
      }
      
    } else {
      console.error('Failed to save question:', await postResponse.text());
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAPI();