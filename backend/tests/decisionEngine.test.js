const { evaluateZones } = require('../services/decisionEngine');

describe('evaluateZones', () => {
  const mockZones = [
    { id: '1', name: 'Food Court A', category: 'Food Court', distance: 100, waitTime: 5, crowdLevel: 30 },
    { id: '2', name: 'Food Court B', category: 'Food Court', distance: 500, waitTime: 20, crowdLevel: 80 },
    { id: '3', name: 'Restroom 1', category: 'Restroom', distance: 50, waitTime: 0, crowdLevel: 10 }
  ];

  it('should return null if no intent is provided', () => {
    const aiIntent = { intent: null, urgency: 'normal', avoid: false };
    const result = evaluateZones(aiIntent, mockZones, 'normal');
    expect(result).toBeNull();
  });

  it('should route to Food Court A based on lower wait time and distance', () => {
    const aiIntent = { intent: 'food court', urgency: 'normal', avoid: false };
    const result = evaluateZones(aiIntent, mockZones, 'normal');
    expect(result.recommendation.id).toBe('1');
    expect(result.response).toContain('Food Court A');
  });

  it('should return null to trigger AI fallback if a valid category has no zones available', () => {
    const aiIntent = { intent: 'gate', urgency: 'normal', avoid: false };
    const result = evaluateZones(aiIntent, mockZones, 'normal');
    // If no zones match the intent, it should return null so api.js hands off to Gemini
    expect(result).toBeNull();
  });

  it('should recommend avoiding a high-wait zone when avoid is true', () => {
    // If avoid is true, it sorts descending (worst score first)
    const aiIntent = { intent: 'food court', urgency: 'normal', avoid: true };
    const result = evaluateZones(aiIntent, mockZones, 'normal');
    
    // In avoidMode, recommendation is null, but the response calls out the worst option
    expect(result.recommendation).toBeNull();
    expect(result.response).toContain('You should avoid Food Court B');
  });
});
