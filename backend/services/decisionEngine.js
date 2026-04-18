const evaluateZones = (message, zones, userType = 'normal') => {
  const msg = message.toLowerCase();
  
  // 1. Determine relevant category based on simple keyword matching
  let category = null;
  if (msg.includes('food') || msg.includes('eat') || msg.includes('hungry') || msg.includes('restaurant')) {
    category = 'Food Court';
  } else if (msg.includes('restroom') || msg.includes('toilet') || msg.includes('bathroom') || msg.includes('washroom')) {
    category = 'Restroom';
  } else if (msg.includes('gate') || msg.includes('flight') || msg.includes('boarding')) {
    category = 'Gate';
  } else if (msg.includes('exit') || msg.includes('leave') || msg.includes('out')) {
    category = 'Exit';
  }

  let relevantZones = zones;
  if (category) {
    relevantZones = zones.filter(z => z.category === category);
  }

  if (relevantZones.length === 0) {
    return {
      response: "I couldn't find any relevant zones for your request.",
      recommendation: null
    };
  }

  // 2. Predictive logic and scoring
  relevantZones.forEach(zone => {
    const random_incoming = Math.floor(Math.random() * 20);
    const random_outgoing = Math.floor(Math.random() * 20);
    zone.future_crowd = Math.max(0, Math.min(100, zone.crowdLevel + random_incoming - random_outgoing));
    
    // 3. Mark zone if future crowd > threshold
    zone.willBeCrowdedSoon = zone.future_crowd > 80;
    
    // Calculate score dynamically based on userType (lower is better)
    let waitWeight = 2;
    let distWeight = 0.1;
    let crowdWeight = 1;

    if (userType === 'fast') {
      waitWeight = 5;
    } else if (userType === 'lazy') {
      distWeight = 0.5;
    } else if (userType === 'urgent') {
      crowdWeight = 3;
      waitWeight = 4;
    }

    zone.score = (zone.waitTime * waitWeight) + (zone.distance * distWeight) + (zone.crowdLevel * crowdWeight);
  });

  // Sort zones by best score
  relevantZones.sort((a, b) => a.score - b.score);
  const bestZone = relevantZones[0];
  
  // 4. Return response
  let reasonPrefix = "";
  if (userType === 'fast') reasonPrefix = "Since you want the fastest option, ";
  else if (userType === 'lazy') reasonPrefix = "Since you prefer shorter walking distance, ";
  else if (userType === 'urgent') reasonPrefix = "Since you need immediate availability, ";

  const crowdDescription = bestZone.crowdLevel < 30 ? "low crowd" : (bestZone.crowdLevel < 70 ? "moderate crowd" : "high crowd");
  
  // Smart Alert System
  const zonesToAvoid = relevantZones.filter(z => (z.crowdLevel > 90 || z.waitTime > 20) && z.id !== bestZone.id);
  
  let responseText = "";
  if (zonesToAvoid.length > 0) {
    const avoidNames = zonesToAvoid.map(z => z.name).join(' and ');
    responseText = `${reasonPrefix}Avoid ${avoidNames} due to heavy congestion. Use ${bestZone.name} instead (${bestZone.waitTime} min wait, ${crowdDescription}).`;
  } else {
    responseText = `${reasonPrefix}${bestZone.name} is recommended (${bestZone.waitTime} min wait, ${crowdDescription}).`;
  }
  
  // Add warnings for other relevant zones that aren't already in the "avoid" list
  const warnings = relevantZones
    .filter(z => z.id !== bestZone.id && z.willBeCrowdedSoon && !zonesToAvoid.includes(z))
    .map(z => `${z.name} will be crowded soon.`);
    
  if (warnings.length > 0) {
    responseText += " " + warnings.join(" ");
  }

  // Add warning if even the best option will be crowded soon
  if (bestZone.willBeCrowdedSoon) {
    responseText += ` Note: ${bestZone.name} might get crowded soon.`;
  }

  return {
    response: responseText,
    recommendation: bestZone
  };
};

module.exports = { evaluateZones };
