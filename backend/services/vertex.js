const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex AI
// Requires GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION environment variables
const project = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

let vertexAiClient = null;
let generativeModel = null;

try {
  vertexAiClient = new VertexAI({ project, location });

  // Instantiate the models
  generativeModel = vertexAiClient.getGenerativeModel({
    model: 'gemini-1.0-pro',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });
  console.log('Vertex AI initialized successfully.');
} catch (error) {
  console.warn('Vertex AI initialization warning:', error.message);
  console.warn('Ensure GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are set, and credentials are valid.');
}

/**
 * Generate a recommendation using Vertex AI Gemini model
 * @param {string} userMessage The user's question
 * @param {Array} zones List of zone objects
 * @returns {Promise<Object>} JSON containing recommendation data
 */
async function generateRecommendation(userMessage, zones) {
  if (!generativeModel) {
    throw new Error('Vertex AI model is not initialized.');
  }

  const prompt = `
You are Aura, an intelligent navigation assistant for a facility (e.g. an airport or mall).
You have access to the following real-time data about different zones:
${JSON.stringify(zones, null, 2)}

The user asks: "${userMessage}"

Analyze the zones data and the user's intent. 
If the user is asking for food, look at the Food Court categories. If looking for a restroom, look at the Restroom category, etc.
Select the BEST single zone for them to go to, considering a balance of low wait time, low distance, and low crowd level.

Return ONLY a JSON object with the following structure:
{
  "response": "A natural language explanation of your recommendation as Aura, mentioning the name, distance, and wait time.",
  "recommendedZoneId": "The string ID (name) of the zone you recommend. Must exactly match one of the zone 'name's provided."
}
`;

  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const streamingResp = await generativeModel.generateContent(request);
    const responseText = streamingResp.response.candidates[0].content.parts[0].text;
    
    // Parse the JSON output from the model
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error generating recommendation from Vertex AI:', error);
    throw error;
  }
}

module.exports = {
  generateRecommendation,
};
