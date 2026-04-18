const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "my-project-stadium-493709",
});

const db = getFirestore("default");

// 🔥 Force correct database + avoid emulator confusion
process.env.FIRESTORE_EMULATOR_HOST = undefined;

async function testFirestore() {
  try {
    const docRef = db.collection("test").doc();

    await docRef.set({
      message: "hello final fix",
      time: new Date(),
    });

    console.log("✅ Firestore working");
  } catch (e) {
    console.error("❌ Firestore error FULL:", e);
  }
}

testFirestore();