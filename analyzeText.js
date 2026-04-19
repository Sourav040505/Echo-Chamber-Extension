export function analyzeText(text) {
  const lower = text.toLowerCase();
  if (lower.includes("fake news") || lower.includes("radical left")) {
    return "Right-leaning bias";
  } else if (lower.includes("corporate media") || lower.includes("far right")) {
    return "Left-leaning bias";
  }
  return "Neutral or mixed bias";
}