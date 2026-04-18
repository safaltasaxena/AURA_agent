const { generateRecommendation } = require('../services/vertex');

async function testVertex() {
  console.log('--- Testing Vertex AI Connectivity ---');
  try {
    console.log('Sending ping request to Gemini 1.5 Flash...');
    // A simple prompt to ensure credentials and API are working
    const response = await generateRecommendation('Ping! Just reply with "Pong".', []);
    
    console.log('Response received:');
    console.log(response);
    
    if (response && response.response) {
      console.log('--- Vertex AI Test Completed Successfully ---');
      process.exit(0);
    } else {
      throw new Error('Invalid response structure received.');
    }
  } catch (error) {
    console.error('--- Vertex AI Test FAILED ---');
    console.error(error.message);
    process.exit(1);
  }
}

testVertex();
