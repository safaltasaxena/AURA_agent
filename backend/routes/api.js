const express = require('express');
const router = express.Router();

console.log("🔥 API FILE LOADED");

// 🔥 SAFE IMPORTS
let db, evaluateZones, generateRecommendation;

try {
  db = require('../services/firebase').db;
  console.log("✅ Firebase loaded");
} catch (e) {
  console.log("❌ Firebase failed:", e.message);
}

try {
  evaluateZones = require('../services/decisionEngine').evaluateZones;
  console.log("✅ Decision engine loaded");
} catch (e) {
  console.log("❌ Decision engine failed:", e.message);
}

try {
  generateRecommendation = require('../services/vertex').generateRecommendation;
  console.log("✅ AI loaded");
} catch (e) {
  console.log("❌ AI failed:", e.message);
}

// ✅ TEST ROUTE
router.get('/test', (req, res) => {
  res.json({ message: "API working ✅" });
});

// 🔥 FULL CHAT LOGIC
router.post('/chat', async (req, res) => {
  try {
    const { message, userType } = req.body;
    console.log("📩 Incoming:", message);

    if (!message) {
      return res.json({ response: "Please enter a message." });
    }

    let zones = [];

    // 🔹 FETCH ZONES FROM FIREBASE
    if (db) {
      try {
        const snapshot = await db.collection('zones').get();
        snapshot.forEach(doc => {
          zones.push({ id: doc.id, ...doc.data() });
        });
        console.log("🔥 ZONES:", zones);
        console.log(`✅ Fetched ${zones.length} zones from Firestore.`);
      } catch (e) {
        console.log("❌ Firestore fetch error:", e.message);
      }
    }

    // 🔹 HARDCODED FALLBACK
    if (zones.length === 0) {
      console.log("⚠️ Zones empty! Using hardcoded fallback zones.");
      zones = [
        { id: 'fc-a', name: 'Food Court A', category: 'Food Court', distance: 120, waitTime: 10, crowdLevel: 65 },
        { id: 'fc-b', name: 'Food Court B', category: 'Food Court', distance: 50, waitTime: 5, crowdLevel: 20 },
        { id: 'rest-1', name: 'North Restroom', category: 'Restroom', distance: 50, waitTime: 2, crowdLevel: 10 },
        { id: 'rest-2', name: 'South Restroom', category: 'Restroom', distance: 400, waitTime: 15, crowdLevel: 80 },
        { id: 'gate-a', name: 'Gate A', category: 'Gate', distance: 500, waitTime: 20, crowdLevel: 90 },
        { id: 'gate-b', name: 'Gate B', category: 'Gate', distance: 150, waitTime: 0, crowdLevel: 30 },
        { id: 'exit-main', name: 'Main Exit', category: 'Exit', distance: 800, waitTime: 0, crowdLevel: 5 }
      ];
    }

    // 🔥 STEP 1 — DECISION ENGINE
    let logicResult = null;

    if (evaluateZones) {
      try {
        logicResult = evaluateZones(message, zones, userType);
      } catch (e) {
        console.log("❌ Logic error:", e.message);
      }
    }

    // 🔥 STEP 2 — AI FALLBACK
    if (!logicResult && generateRecommendation) {
      try {
        const ai = await generateRecommendation(message, zones);

        return res.json({
          response: ai?.response || "I'm here to help 😊",
          recommendation: null,
          meta: { source: "ai" }
        });
      } catch (e) {
        console.log("❌ AI fallback error:", e.message);
      }
    }

    // 🔥 STEP 3 — HYBRID RESPONSE
    let finalResponse = logicResult?.response || "Let me help you.";
    let finalZone = logicResult?.recommendation || null;

    if (!logicResult) {
      const ai = await generateRecommendation(message, zones);

      return res.json({
        response: ai?.response || "I'm here to help 😊",
        recommendation: null,
        meta: { source: "ai" }
      });
    }

    // ✅ FINAL RESPONSE
    res.json({
      response:
        finalResponse +
        "\n\n📊 Based on real-time crowd, wait time, and distance.",
      recommendation: finalZone,
      meta: { source: "logic" }
    });

  } catch (err) {
    console.error("❌ Chat crash:", err);

    res.json({
      response: "Something went wrong, but I’m still here to help!",
      recommendation: null
    });
  }
});

module.exports = router;