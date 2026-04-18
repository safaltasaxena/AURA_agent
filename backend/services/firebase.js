const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
// Uses Google Application Default Credentials (ADC) exclusively.
// No service account JSON key is required or supported.
// Ensure your Antigravity or Cloud Run environment has ADC configured.

try {
  admin.initializeApp();
  console.log('Firebase Admin initialized with Application Default Credentials (ADC).');
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  console.warn('Continuing without strict Firebase setup. Ensure ADC is available.');
}

const db = getFirestore("default");

module.exports = { admin, db };
