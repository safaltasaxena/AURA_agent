const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { evaluateZones } = require('../services/decisionEngine');
const { generateRecommendation } = require('../services/vertex');

// ✅ TEST ROUTE (VERY IMPORTANT FOR DEBUG)
router.get('/test', (req, res) => {
  res.json({ message: "API working ✅" });
});

// ✅ HEALTH CHECK
router.get('/health', async (req, res) => {
  const status = { firestore: 'error', ai: 'error' };

  try {
    await db.collection('zones').limit(1).get();
    status.firestore = 'ok';
  } catch (e) {
    console.log("Firestore error:", e.message);
  }

  try {
    const ai = await generateRecommendation("hello", []);
    if (ai) status.ai = 'ok';
  } catch (e) {
    console.log("AI error:", e.message);
  }

  res.json(status);
});

// 🔥 CHAT ENDPOINT
router.post('/chat', async (req, res) => {
  try {
    const { message, userType } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // 🔹 Fetch zones
    const snapshot = await db.collection('zones').get();
    const zones = [];

    snapshot.forEach(doc => {
      zones.push({ id: doc.id, ...doc.data() });
    });

    // 🔥 STEP 1 — LOGIC
    const logicResult = evaluateZones(message, zones, userType);

    // 🔥 STEP 2 — AI FALLBACK
    if (!logicResult) {
      const aiResult = await generateRecommendation(message, zones);

      return res.json({
        response:
          aiResult?.response ||
          "I didn’t fully understand that. You can ask me about food, restrooms, gates, or exits.",
        recommendation: null,
        meta: { source: "ai" }
      });
    }

    // 🔥 STEP 3 — HYBRID
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
    } catch (e) {
      console.log("AI enhancement failed:", e.message);
    }

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