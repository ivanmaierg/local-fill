console.log("Local-Fill: Content script loaded");
function initializeContentScript() {
  console.log("Local-Fill: Initializing content script");
  setupMessageListeners();
  setupKeyboardShortcuts();
  injectOverlayUI();
}
function setupMessageListeners() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Local-Fill: Content script received message", message);
    switch (message.type) {
      case "TRIGGER_AUTOFILL":
        handleTriggerAutofill();
        break;
      case "SHOW_SUGGESTIONS":
        handleShowSuggestions(message.field);
        break;
      default:
        console.warn("Local-Fill: Unknown message type in content script", message.type);
    }
  });
}
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "a") {
      event.preventDefault();
      handleTriggerAutofill();
    }
  });
}
function injectOverlayUI() {
  const overlay = document.createElement("div");
  overlay.id = "local-fill-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
  `;
  document.body.appendChild(overlay);
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("overlay.js");
  script.type = "module";
  document.head.appendChild(script);
}
async function handleTriggerAutofill() {
  console.log("Local-Fill: Triggering autofill");
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_ACTIVE_PROFILE" });
    if (!response.success || !response.data.activeProfile) {
      console.warn("Local-Fill: No active profile found");
      return;
    }
    const fields = scanFormFields();
    console.log("Local-Fill: Found fields", fields);
  } catch (error) {
    console.error("Local-Fill: Error during autofill", error);
  }
}
function handleShowSuggestions(field) {
  console.log("Local-Fill: Showing suggestions for field", field);
}
function scanFormFields() {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    "textarea",
    "select"
  ];
  const fields = [];
  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        fields.push(element);
      }
    });
  });
  return fields;
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentScript);
} else {
  initializeContentScript();
}
//# sourceMappingURL=content.js.map
