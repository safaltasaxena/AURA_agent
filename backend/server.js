const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Load full API Routes
const apiRoutes = require('./routes/api');
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