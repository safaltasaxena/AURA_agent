require('dotenv').config();
console.log("API KEY:", process.env.GOOGLE_API_KEY ? "LOADED ✅" : "MISSING ❌");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

async function generateRecommendation(userMessage, zones) {
  try {
    const prompt = `
You are Aura, an intelligent assistant for a stadium.

User query:
"${userMessage}"

Available zones:
${JSON.stringify(zones)}

Instructions:
- Understand user intent
- If zone-related → pick BEST zone based on:
  wait time, distance, crowd
- If NOT zone-related → respond naturally
- ALWAYS respond in STRICT JSON

Format:
{
  "response": "your answer",
  "recommendedZoneName": "exact zone name OR null"
}

DO NOT add anything outside JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🔥 SAFE JSON PARSE
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // fallback if model adds extra text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }

      return {
        response: text || "I'm here to help!",
        recommendedZoneName: null,
      };
    }

  } catch (err) {
    console.log("AI failed:", err.message);

    // 🔥 STRONG FALLBACK (IMPORTANT)
    return {
      response:
        "I couldn't fully process that, but I can help with food, restrooms, gates, or exits.",
      recommendedZoneName: null,
    };
  }
}

module.exports = { generateRecommendation };
