const { db } = require('../services/firebase');

async function testFirestore() {
  console.log('--- Testing Firestore Connectivity ---');
  try {
    const testDocRef = db.collection('test_collection').doc('test_doc');
    
    // Write
    console.log('Attempting to write test document...');
    await testDocRef.set({ timestamp: new Date().toISOString(), status: 'success' });
    console.log('Write successful.');

    // Read
    console.log('Attempting to read test document...');
    const doc = await testDocRef.get();
    if (doc.exists) {
      console.log('Read successful:', doc.data());
    } else {
      throw new Error('Document does not exist after write.');
    }

    console.log('--- Firestore Test Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('--- Firestore Test FAILED ---');
    console.error(error.message);
    process.exit(1);
  }
}

testFirestore();
