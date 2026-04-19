// content.js

console.log("Content script is running...");

const pageText = document.body.textContent.toLowerCase(); // Lowercase for easier analysis
console.log("Page Text:", pageText);

// Weighted keywords for better accuracy
const weightedKeywordsLeft = {
  "green new deal": 3,
  "tax the rich": 2,
  "feminism": 1,
  "lgbtq+ rights": 2,
  "climate change": 2,
  "intersectionality": 2,
  "socialism": 3,
  "black lives matter": 2,
  "medicare for all": 3,
  "universal healthcare": 2,
  "racial justice": 2,
  "student debt relief": 2,
  "progressive": 1,
  "abortion rights": 2
};

const weightedKeywordsRight = {
  "maga": 3,
  "tax cuts": 2,
  "gun rights": 2,
  "border wall": 3,
  "religious freedom": 2,
  "conservative": 1,
  "small government": 2,
  "patriot": 2,
  "traditional values": 2,
  "pro life": 2,
  "capitalism": 1,
  "second amendment": 2,
  "murder": 3,  // newly added
  "harm": 3     // newly added
};

// Disturbing content categories (not linked to political leanings)
const disturbingContent = {
  violence: ["kill", "murder", "blood", "gore", "harm", "behead", "execute"],
  abuse: ["assault", "abuse", "rape", "molest", "harass"],
  extremism: ["terror", "torture", "radical", "extremist", "militant"]
};

function weightedCount(text, weightedWords) {
  let score = 0;
  for (let word in weightedWords) {
    if (text.includes(word)) {
      score += weightedWords[word];
    }
  }
  return score;
}

function detectBias(text) {
  const wordCount = text.split(/\s+/).length;

  const leftScore = weightedCount(text, weightedKeywordsLeft);
  const rightScore = weightedCount(text, weightedKeywordsRight);

  let disturbingCount = 0;
  const flags = [];

  // Check for disturbing content (not linked to political bias directly)
  for (let category in disturbingContent) {
    for (let word of disturbingContent[category]) {
      if (text.includes(word)) {
        disturbingCount++;
        flags.push(category);  // List disturbing categories separately
        break;
      }
    }
  }

  let bias = "Neutral or Mixed";
  let confidence = 0;

  // Determine bias based on weighted keyword scores
  if (leftScore > rightScore) {
    bias = "Left-leaning";
    confidence = ((leftScore - rightScore) / wordCount * 1000).toFixed(2);
  } else if (rightScore > leftScore) {
    bias = "Right-leaning";
    confidence = ((rightScore - leftScore) / wordCount * 1000).toFixed(2);
  }

  if (disturbingCount > 0) {
    // Append disturbing content separately from bias
    bias += ` | ⚠️ Disturbing content (${flags.join(", ")})`;
  }

  return { bias, confidence, flags };
}

const { bias, confidence, flags } = detectBias(pageText);
console.log("Detected Bias:", bias);
window.detectedBias = bias;

let leftFlagCount = 0;
let rightFlagCount = 0;
let violenceFlagCount = 0;
let abuseFlagCount = 0;
let extremismFlagCount = 0;

if (bias === "Left-leaning") leftFlagCount++;
else if (bias === "Right-leaning") rightFlagCount++;
if (flags.includes("violence")) violenceFlagCount++;
if (flags.includes("abuse")) abuseFlagCount++;
if (flags.includes("extremism")) extremismFlagCount++;

function showBiasOverlay(bias, confidence, flags) {
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <strong>🧠 Bias Detected: ${bias}</strong><br>
    Confidence: ${confidence}%<br>
    Flags: ${flags.join(', ')}<br>
    <br>
    <strong>Counts:</strong><br>
    Left Flags: ${leftFlagCount}<br>
    Right Flags: ${rightFlagCount}<br>
    Violence: ${violenceFlagCount}<br>
    Abuse: ${abuseFlagCount}<br>
    Extremism: ${extremismFlagCount}<br>
  `;
  overlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 14px;
    z-index: 9999;
    width: 250px;
  `;
  document.body.appendChild(overlay);
}

showBiasOverlay(bias, confidence, flags);

// popup.js
document.addEventListener("DOMContentLoaded", function () {
  const status = document.getElementById("status");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      status.textContent = "Could not access the current tab.";
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => window.detectedBias || "Bias not available"
      },
      (results) => {
        if (chrome.runtime.lastError) {
          status.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
        }

        const result = results[0]?.result || "No result returned.";
        status.textContent = result;
      }
    );
  });
});
