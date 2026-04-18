const { evaluateZones } = require('../services/decisionEngine');

const mockZones = [
  { id: '1', name: 'Food Court A', category: 'Food Court', waitTime: 10, distance: 200, crowdLevel: 85 },
  { id: '2', name: 'Food Court B', category: 'Food Court', waitTime: 5, distance: 50, crowdLevel: 20 },
  { id: '3', name: 'Gate A', category: 'Gate', waitTime: 25, distance: 500, crowdLevel: 95 },
  { id: '4', name: 'Gate B', category: 'Gate', waitTime: 5, distance: 400, crowdLevel: 40 },
  { id: '5', name: 'Exit Main', category: 'Exit', waitTime: 0, distance: 800, crowdLevel: 10 }
];

console.log('--- Running Local Decision Engine Tests ---');

console.log('\nTest 1: Food Recommendation (Normal User)');
const res1 = evaluateZones('I am hungry, where can I eat?', mockZones, 'normal');
console.log('Result:', res1.response);

console.log('\nTest 2: Exit Suggestion (Normal User)');
const res2 = evaluateZones('How do I leave?', mockZones, 'normal');
console.log('Result:', res2.response);

console.log('\nTest 3: Congestion Alert (Gate Search)');
const res3 = evaluateZones('Where is my flight boarding?', mockZones, 'normal');
console.log('Result:', res3.response);

console.log('\nTest 4: Personalized Response (Lazy User - heavily weights distance)');
const res4 = evaluateZones('I want food but I hate walking', mockZones, 'lazy');
console.log('Result:', res4.response);

console.log('\n--- All Tests Completed ---');
