chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    settings: {
      aiAssist: false,
      hotkey: 'Alt+A',
      allowlist: ['<all_urls>']
    }
  });
});

// Helper function to safely send messages to content scripts
async function sendMessageToContentScript(tabId: number, message: any): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, message);
    return true;
  } catch (error) {
    console.warn('Failed to send message to content script:', error);
    return false;
  }
}

// Determine if we can message a given tab based on its URL
function canMessageTab(tab: chrome.tabs.Tab): boolean {
  if (!tab.id || !tab.url) return false;
  try {
    const url = new URL(tab.url);
    const forbiddenProtocols = new Set(['chrome:', 'chrome-extension:', 'edge:', 'about:', 'moz-extension:']);
    if (forbiddenProtocols.has(url.protocol)) return false;

    const forbiddenHosts = new Set([
      'chrome.google.com',
      'chromewebstore.google.com',
      'newtab',
    ]);
    if (forbiddenHosts.has(url.host)) return false;
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if content script is ready
async function isContentScriptReady(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch (error) {
    return false;
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!canMessageTab(tab)) {
    console.warn('Tab is not eligible for messaging:', tab.url);
    return;
  }
  if (tab.id) {
    const success = await sendMessageToContentScript(tab.id, { type: 'TOGGLE_SIDEBAR' });
    if (!success) {
      console.warn('Content script not ready, attempting to inject...');
      // Try to inject the content script if it's not ready
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Wait a bit for the script to initialize
        setTimeout(() => {
          if (tab.id) {
            sendMessageToContentScript(tab.id, { type: 'TOGGLE_SIDEBAR' });
          }
        }, 100);
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
      }
    }
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'trigger-autofill') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab && canMessageTab(tab) && tab.id) {
      const success = await sendMessageToContentScript(tab.id, { type: 'TRIGGER_AUTOFILL' });
      if (!success) {
        console.warn('Content script not ready for autofill command');
      }
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'GET_ACTIVE_PROFILE':
      handleGetActiveProfile(sendResponse);
      return true;
      
    case 'GET_RULES':
      handleGetRules(message.domain, sendResponse);
      return true;
      
    case 'SAVE_RULE':
      handleSaveRule(message.rule, sendResponse);
      return true;
    
    case 'OPEN_OPTIONS':
      try {
        chrome.runtime.openOptionsPage();
        sendResponse({ success: true });
      } catch (e) {
        const err = e instanceof Error ? e.message : 'Unknown error';
        sendResponse({ success: false, error: err });
      }
      return true;
      
    default:
      sendResponse({ error: 'Unknown message type' });
      return true;
  }
});

async function handleGetActiveProfile(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['activeProfile', 'profiles']);
    const activeProfile = result['activeProfile'] || null;
    const profiles = result['profiles'] || [];
    
    sendResponse({ success: true, data: { activeProfile, profiles } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleGetRules(domain: string, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result['rules'] || {};
    const domainRules = rules[domain] || [];
    
    sendResponse({ success: true, data: domainRules });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleSaveRule(rule: any, sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result['rules'] || {};
    
    if (!rules[rule.domain]) {
      rules[rule.domain] = [];
    }
    
    rules[rule.domain].push(rule);
    await chrome.storage.local.set({ rules });
    
    sendResponse({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}