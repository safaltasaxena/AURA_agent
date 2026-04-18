const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { evaluateZones } = require('../services/decisionEngine');
const { generateRecommendation } = require('../services/vertex');

// 🔥 CHAT ENDPOINT
router.post('/chat', async (req, res) => {
  try {
    const { message, userType } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // 🔹 fetch zones
    const snapshot = await db.collection('zones').get();
    const zones = [];

    snapshot.forEach(doc => {
      zones.push({ id: doc.id, ...doc.data() });
    });

    // 🔥 STEP 1 — LOGIC FIRST
    const logicResult = evaluateZones(message, zones, userType);

    // 🔥 STEP 2 — IF LOGIC FAILS → AI
    if (!logicResult) {
      const aiResult = await generateRecommendation(message, zones);

      return res.json({
        response:
          aiResult?.response ||
          "I didn't fully understand that. You can ask me about food, restrooms, gates, or exits.",
        recommendation: null,
        meta: { source: "ai/fallback" }
      });
    }

    // 🔥 STEP 3 — LOGIC WORKS → TRY AI ENHANCEMENT
    let finalResponse = logicResult.response;
    let finalZone = logicResult.recommendation;

    try {
      const aiResult = await generateRecommendation(message, zones);

      if (aiResult?.recommendedZoneName) {
        const zone = zones.find(z => z.name === aiResult.recommendedZoneName);

        if (zone) {
          finalZone = zone;
          finalResponse = aiResult.response;
        }
      }
    } catch {
      // ignore AI failure
    }

    // 🔥 FINAL RESPONSE
    res.json({
      response:
        finalResponse +
        "\n\n📊 Based on real-time crowd, wait time, and distance.",
      recommendation: finalZone,
      meta: { source: "hybrid" }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;