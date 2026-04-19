const express = require('express');
const router = express.Router();

console.log("🔥 API FILE LOADED");

// 🔥 FAIL-FAST IMPORTS (Server should crash if these are missing)
const { db } = require('../services/firebase');
const { evaluateZones } = require('../services/decisionEngine');
const { extractIntent } = require('../services/vertex');

// 🚀 IN-MEMORY CACHE
let zonesCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

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

    // 🔹 FETCH ZONES FROM FIREBASE (WITH CACHE)
    if (db) {
      const now = Date.now();
      if (zonesCache && (now - lastCacheTime < CACHE_TTL)) {
        zones = zonesCache;
      } else {
        try {
          const snapshot = await db.collection('zones').get();
          snapshot.forEach(doc => {
            zones.push({ id: doc.id, ...doc.data() });
          });
          zonesCache = zones;
          lastCacheTime = now;
          console.log(`✅ Fetched ${zones.length} zones from Firestore (Cached for 30s).`);
        } catch (e) {
          console.error("❌ Firestore fetch error:", e.message);
          if (zonesCache) zones = zonesCache; // Fallback to stale cache
        }
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

    // 🔥 STEP 1 — AI INTENT EXTRACTION
    let aiIntent = null;
    if (extractIntent) {
      aiIntent = await extractIntent(message);
    } else {
      aiIntent = { intent: null, urgency: "normal", avoid: false, conversational_response: "AI Offline" };
    }

    console.log("🧠 AI Structured Intent:", aiIntent);

    // 🔥 STEP 2 — HYBRID ROUTING
    if (!aiIntent.intent) {
      // It's a conversational message or unknown intent
      return res.json({
        response: aiIntent.conversational_response || "I'm here to help 😊",
        recommendation: null,
        meta: { source: "ai" }
      });
    }

    // It is a zone intent! Let the logic engine evaluate it.
    let logicResult = null;
    if (evaluateZones) {
      try {
        logicResult = evaluateZones(aiIntent, zones, userType);
      } catch (e) {
        console.error("❌ Logic error:", e.message);
      }
    }

    let finalResponse = logicResult?.response || "I found something, but had trouble formatting it.";
    let finalZone = logicResult?.recommendation || null;

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