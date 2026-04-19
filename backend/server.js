const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 🔒 SECURITY: HTTP Header Hardening
app.use(helmet());

// 🔒 SECURITY: Strict CORS
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// 🔒 SECURITY: LLM Rate Limiting
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { response: "Rate limit exceeded. Please try again in a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// Load full API Routes
const apiRoutes = require('./routes/api');
app.use('/api/chat', chatLimiter); // Protect AI endpoint
app.use('/api', apiRoutes);

const path = require('path');

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the React app for any unhandled routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(8080, () => {
  console.log("Backend running on 8080");
});