console.log("Local-Fill: Background service worker loaded");
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Local-Fill: Extension installed/updated", details);
  chrome.storage.local.set({
    settings: {
      aiAssist: false,
      hotkey: "Alt+A",
      allowlist: [
        "boards.greenhouse.io",
        "jobs.lever.co",
        "*.myworkdayjobs.com",
        "*.ashbyhq.com"
      ]
    }
  });
});
chrome.commands.onCommand.addListener((command) => {
  console.log("Local-Fill: Command received", command);
  if (command === "trigger-autofill") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "TRIGGER_AUTOFILL" });
      }
    });
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Local-Fill: Message received", message);
  switch (message.type) {
    case "GET_ACTIVE_PROFILE":
      handleGetActiveProfile(sendResponse);
      return true;
    case "GET_RULES":
      handleGetRules(message.domain, sendResponse);
      return true;
    case "SAVE_RULE":
      handleSaveRule(message.rule, sendResponse);
      return true;
    default:
      console.warn("Local-Fill: Unknown message type", message.type);
      sendResponse({ error: "Unknown message type" });
  }
});
async function handleGetActiveProfile(sendResponse) {
  try {
    const result = await chrome.storage.local.get(["activeProfile", "profiles"]);
    const activeProfile = result.activeProfile || null;
    const profiles = result.profiles || [];
    sendResponse({ success: true, data: { activeProfile, profiles } });
  } catch (error) {
    console.error("Local-Fill: Error getting active profile", error);
    sendResponse({ success: false, error: error.message });
  }
}
async function handleGetRules(domain, sendResponse) {
  try {
    const result = await chrome.storage.local.get(["rules"]);
    const rules = result.rules || {};
    const domainRules = rules[domain] || [];
    sendResponse({ success: true, data: domainRules });
  } catch (error) {
    console.error("Local-Fill: Error getting rules", error);
    sendResponse({ success: false, error: error.message });
  }
}
async function handleSaveRule(rule, sendResponse) {
  try {
    const result = await chrome.storage.local.get(["rules"]);
    const rules = result.rules || {};
    if (!rules[rule.domain]) {
      rules[rule.domain] = [];
    }
    rules[rule.domain].push(rule);
    await chrome.storage.local.set({ rules });
    sendResponse({ success: true });
  } catch (error) {
    console.error("Local-Fill: Error saving rule", error);
    sendResponse({ success: false, error: error.message });
  }
}
//# sourceMappingURL=background.js.map
