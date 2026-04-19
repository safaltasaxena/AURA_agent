const getCrowdLabel = (c) => {
  if (c < 30) return "low";
  if (c < 70) return "moderate";
  return "high";
};

const evaluateZones = (message, zones, userType = 'normal') => {
  const msg = message.toLowerCase();

  // 🔥 Non-zone queries → let AI handle
  const nonZonePatterns = [
    /who are you/,
    /what can you do/,
    /tell me/,
    /joke/,
    /hi/,
    /hello/,
    /hey/
  ];

  if (nonZonePatterns.some(p => p.test(msg))) {
    return null;
  }

  // 🔥 Detect category (normalized)
  let category = null;

  if (msg.match(/food|eat|hungry|restaurant/)) {
    category = 'food court';
  } else if (msg.match(/restroom|toilet|bathroom|washroom/)) {
    category = 'restroom';
  } else if (msg.match(/gate|boarding/)) {
    category = 'gate';
  } else if (msg.match(/exit|leave|out|go home/)) {
    category = 'exit';
  }

  // ❌ If nothing matched → AI
  if (!category) return null;

  console.log(`\n[DECISION ENGINE] Processing Request`);
  console.log(`[DECISION ENGINE] Total Zones Available: ${zones.length}`);
  console.log(`[DECISION ENGINE] Detected Intent Category: '${category}'`);

  // 🔥 HIGHLY ROBUST FILTER (Strips spaces, hyphens, and cases)
  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedTargetCategory = normalize(category);

  const relevantZones = zones.filter(
    z => normalize(z.category) === normalizedTargetCategory
  );

  console.log(`[DECISION ENGINE] Matched Zones Count: ${relevantZones.length}`);

  if (!relevantZones.length) {
    console.log(`[DECISION ENGINE] No relevant zones found for category: ${category}. Falling back to AI.`);
    return null; // Let the AI handle it instead of returning a generic failure message
  }

  // 🔥 Detect special intents
  const avoidMode = /avoid|not go|worst|bad/.test(msg);

  let waitWeight = 2;
  let distWeight = 0.1;
  let crowdWeight = 1;

  // 🔥 Intent-based priority
  if (msg.match(/quick|fast|hurry|asap/)) {
    waitWeight = 5;
  }

  if (msg.match(/don.?t.*walk|dont.*walk|no walking|near|close|nearest|closest/)) {
    distWeight = 3; // 🔥 VERY IMPORTANT
  }

  if (msg.match(/crowd|busy|avoid crowd/)) {
    crowdWeight = 3;
  }

  // 🔥 userType override
  if (userType === 'fast') waitWeight = 5;
  if (userType === 'lazy') distWeight = 3;
  if (userType === 'urgent') {
    waitWeight = 4;
    crowdWeight = 3;
  }

  // 🔥 SCORING
  relevantZones.forEach(zone => {
    zone.score =
      zone.waitTime * waitWeight +
      zone.distance * distWeight +
      zone.crowdLevel * crowdWeight;
  });

  // 🔥 SORT
  relevantZones.sort((a, b) =>
    avoidMode ? b.score - a.score : a.score - b.score
  );

  const selectedZone = relevantZones[0];
  const crowdLabel = getCrowdLabel(selectedZone.crowdLevel);

  let response;

  if (avoidMode) {
    response = `You should avoid ${selectedZone.name}. It has ${crowdLabel} crowd and about ${selectedZone.waitTime} minutes wait time.`;
  } else {
    response = `I'd recommend ${selectedZone.name}. It has ${crowdLabel} crowd with around ${selectedZone.waitTime} minutes wait time and is about ${selectedZone.distance} meters away.`;
  }

  // 🔥 Extra improvement
  if (!avoidMode && selectedZone.waitTime === 0 && selectedZone.crowdLevel < 20) {
    response += " This is an optimal low-traffic option.";
  }

  return {
    response,
    recommendation: avoidMode ? null : selectedZone
  };
};

module.exports = { evaluateZones };