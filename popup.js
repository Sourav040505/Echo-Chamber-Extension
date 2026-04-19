document.addEventListener("DOMContentLoaded", function () {
  const status = document.getElementById("status");
  const biasDisplay = document.getElementById("bias");
  const confidenceDisplay = document.getElementById("confidence");
  const leftFlagDisplay = document.getElementById("leftFlags");
  const rightFlagDisplay = document.getElementById("rightFlags");
  const violenceFlagDisplay = document.getElementById("violenceFlags");
  const abuseFlagDisplay = document.getElementById("abuseFlags");
  const extremismFlagDisplay = document.getElementById("extremismFlags");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      status.textContent = "Could not access the current tab.";
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          return {
            bias: window.detectedBias,
            confidence: window.detectedConfidence,
            leftFlagCount: window.leftFlagCount,
            rightFlagCount: window.rightFlagCount,
            violenceFlagCount: window.violenceFlagCount,
            abuseFlagCount: window.abuseFlagCount,
            extremismFlagCount: window.extremismFlagCount
          };
        }
      },
      (results) => {
        if (chrome.runtime.lastError) {
          status.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
        }

        const result = results[0]?.result;
        if (result) {
          biasDisplay.textContent = `Bias Detected: ${result.bias}`;
          confidenceDisplay.textContent = `Confidence: ${result.confidence}%`;
          leftFlagDisplay.textContent = `Left Flags: ${result.leftFlagCount}`;
          rightFlagDisplay.textContent = `Right Flags: ${result.rightFlagCount}`;
          violenceFlagDisplay.textContent = `Violence: ${result.violenceFlagCount}`;
          abuseFlagDisplay.textContent = `Abuse: ${result.abuseFlagCount}`;
          extremismFlagDisplay.textContent = `Extremism: ${result.extremismFlagCount}`;
        } else {
          status.textContent = "No result returned.";
        }
      }
    );
  });
});
