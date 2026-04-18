const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "my-project-stadium-493709",
});

// ✅ Correct way
const db = admin.firestore();

async function testFirestore() {
  try {
    await db.collection("test").add({
      message: "hello working",
      time: new Date(),
    });

    console.log("✅ Firestore working");
  } catch (e) {
    console.error("❌ Firestore error:", e);
  }
}

testFirestore();