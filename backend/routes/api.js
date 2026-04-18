const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');
const { evaluateZones } = require('../services/decisionEngine');
const { generateRecommendation } = require('../services/vertex');

// Unified Health Check API
router.get('/health', async (req, res) => {
  const status = { firestore: 'error', vertex_ai: 'error' };
  
  try {
    // Test Firestore
    const snapshot = await db.collection('zones').limit(1).get();
    status.firestore = 'ok';
  } catch (err) {
    console.error('Health Check - Firestore error:', err.message);
  }

  try {
    // Test Vertex AI
    await generateRecommendation("ping", []);
    status.vertex_ai = 'ok';
  } catch (err) {
    console.error('Health Check - Vertex AI error:', err.message);
  }

  const statusCode = (status.firestore === 'ok' && status.vertex_ai === 'ok') ? 200 : 500;
  res.status(statusCode).json(status);
});

// Get all zones
router.get('/zones', async (req, res) => {
  try {
    const snapshot = await db.collection('zones').get();
    const zones = [];
    snapshot.forEach(doc => {
      zones.push({ id: doc.id, ...doc.data() });
    });
    res.json(zones);
  } catch (error) {
    console.error('Error getting zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

// Chat endpoint for recommendations
router.post('/chat', async (req, res) => {
  try {
    const { message, userType } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch all zones to provide as context to Vertex AI
    const snapshot = await db.collection('zones').get();
    if (snapshot.empty) {
      return res.json({ 
        response: `I couldn't find any zone data right now.`,
        recommendation: null
      });
    }

    const zones = [];
    snapshot.forEach(doc => {
      zones.push({ id: doc.id, ...doc.data() });
    });

    // Use the smart decision engine to reason and generate a recommendation
    const aiResult = evaluateZones(message, zones, userType);
    
    res.json({
      response: aiResult.response,
      recommendation: aiResult.recommendation
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error processing chat' });
  }
});

module.exports = router;
