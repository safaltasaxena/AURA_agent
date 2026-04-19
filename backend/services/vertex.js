require('dotenv').config();
console.log("API KEY:", process.env.GOOGLE_API_KEY ? "LOADED ✅" : "MISSING ❌");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

async function extractIntent(userMessage) {
  try {
    const prompt = `
You are Aura, an intelligent assistant for a stadium.

User query:
"${userMessage}"

Instructions:
Analyze the user's query and extract their intent for our routing engine.
Respond in STRICT RAW JSON with the following schema:
{
  "intent": string (Must be one of: "food court", "restroom", "gate", "exit". If not related to these, set to null),
  "urgency": string (Must be one of: "normal", "high", "low". Default to "normal"),
  "avoid": boolean (Set to true if the user wants to avoid something, e.g. "avoid the crowd"),
  "conversational_response": string (If intent is null, answer the user naturally here. Otherwise, set to null)
}

DO NOT include markdown tags like \`\`\`json. Return only the raw JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔥 SAFE JSON PARSE
    try {
      // Strip out markdown if the model hallucinated it
      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch {
      return {
        intent: null,
        urgency: "normal",
        avoid: false,
        conversational_response: "I'm having trouble understanding. Can you specify if you need food, restrooms, gates, or exits?"
      };
    }
  } catch (err) {
    console.error("❌ AI extraction failed:", err.message);
    return {
      intent: null,
      urgency: "normal",
      avoid: false,
      conversational_response: "I'm experiencing a delay, but I can still help you find standard zones."
    };
  }
}

module.exports = { extractIntent };


