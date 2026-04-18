const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "my-project-stadium-493709",
  });
}

const db = admin.firestore();

module.exports = { admin, db };