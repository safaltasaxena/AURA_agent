const { db } = require('../services/firebase');

const initialZones = [
  { name: 'Gate A', category: 'Gate', crowdLevel: 20, waitTime: 5, distance: 100 },
  { name: 'Gate B', category: 'Gate', crowdLevel: 80, waitTime: 15, distance: 400 },
  { name: 'Food Court A', category: 'Food Court', crowdLevel: 45, waitTime: 10, distance: 200 },
  { name: 'Food Court B', category: 'Food Court', crowdLevel: 90, waitTime: 25, distance: 50 },
  { name: 'Restroom A', category: 'Restroom', crowdLevel: 10, waitTime: 0, distance: 150 },
  { name: 'Restroom B', category: 'Restroom', crowdLevel: 60, waitTime: 8, distance: 300 },
  { name: 'Exit A', category: 'Exit', crowdLevel: 30, waitTime: 2, distance: 500 },
  { name: 'Exit B', category: 'Exit', crowdLevel: 5, waitTime: 0, distance: 800 }
];

async function seedData() {
  console.log('Starting to seed data...');
  try {
    const batch = db.batch();
    const zonesRef = db.collection('zones');

    for (const zone of initialZones) {
      // Create a document with the zone name as the ID, lowercased and spaces replaced
      const docId = zone.name.toLowerCase().replace(/\s+/g, '-');
      const docRef = zonesRef.doc(docId);
      batch.set(docRef, zone);
      console.log(`Prepared to add: ${zone.name}`);
    }

    await batch.commit();
    console.log('Successfully seeded database with initial zones!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
