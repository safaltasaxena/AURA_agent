const getCrowdLabel = (c) => {
  if (c < 30) return "low";
  if (c < 70) return "moderate";
  return "high";
};

const evaluateZones = (message, zones, userType = 'normal') => {
  const msg = message.toLowerCase();

  // 🔥 NON-ZONE → let AI handle
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

  // 🔥 NEGATIVE intent
  const avoidMode = /avoid|not go|worst|bad/.test(msg);

  let category = null;

  if (msg.match(/food|eat|hungry|restaurant/)) {
    category = 'Food Court';
  } else if (msg.match(/restroom|toilet|bathroom|washroom/)) {
    category = 'Restroom';
  } else if (msg.match(/gate|boarding/)) {
    category = 'Gate';
  } else if (msg.match(/exit|leave|out|go home/)) {
    category = 'Exit';
  }

  // 🔥 If no category → AI
  if (!category) return null;

  const relevantZones = zones.filter(z => z.category === category);

  if (!relevantZones.length) {
    return {
      response: "I couldn't find relevant zones right now.",
      recommendation: null
    };
  }

  // 🔥 BASE WEIGHTS
  let waitWeight = 2;
  let distWeight = 0.1;
  let crowdWeight = 1;

  // 🔥 KEY FIX: intent-based priority
  if (msg.match(/quick|fast|hurry|asap/)) {
    waitWeight = 5;
  }

  if (msg.match(/don.?t want to walk|dont want to walk|near|close/)) {
    distWeight = 2; // 🔥 VERY HIGH priority
  }

  if (msg.match(/crowd|busy|avoid crowd/)) {
    crowdWeight = 3;
  }

  // 🔥 userType override
  if (userType === 'fast') waitWeight = 5;
  if (userType === 'lazy') distWeight = 2;
  if (userType === 'urgent') {
    waitWeight = 4;
    crowdWeight = 3;
  }

  // 🔥 scoring
  relevantZones.forEach(zone => {
    zone.score =
      zone.waitTime * waitWeight +
      zone.distance * distWeight +
      zone.crowdLevel * crowdWeight;
  });

  // 🔥 sort logic
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

  if (!avoidMode && selectedZone.waitTime === 0 && selectedZone.crowdLevel < 20) {
    response += " This is an optimal low-traffic option.";
  }

  return {
    response,
    recommendation: avoidMode ? null : selectedZone
  };
};

module.exports = { evaluateZones };