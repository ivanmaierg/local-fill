// IndexedDB and chrome.storage utilities for Local-Fill

export interface StorageProfile {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface StorageSettings {
  aiAssist: boolean;
  hotkey: string;
  allowlist: string[];
}

export interface StorageRule {
  id: string;
  domain: string;
  field: string;
  selector: string;
  confidence: number;
  createdAt: string;
}

export interface StorageSnippet {
  id: string;
  name: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageLog {
  id: string;
  timestamp: string;
  action: string;
  domain: string;
  details: any;
}

// IndexedDB wrapper for profiles
export class ProfileStorage {
  private dbName = 'local-fill-profiles';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          const store = db.createObjectStore('profiles', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // Create rules store
        if (!db.objectStoreNames.contains('rules')) {
          const store = db.createObjectStore('rules', { keyPath: 'id' });
          store.createIndex('domain', 'domain', { unique: false });
        }
        
        // Create snippets store
        if (!db.objectStoreNames.contains('snippets')) {
          const store = db.createObjectStore('snippets', { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // Create logs store
        if (!db.objectStoreNames.contains('logs')) {
          const store = db.createObjectStore('logs', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('action', 'action', { unique: false });
          store.createIndex('domain', 'domain', { unique: false });
        }
      };
    });
  }

  async saveProfile(profile: StorageProfile): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      const request = store.put(profile);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getProfile(id: string): Promise<StorageProfile | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllProfiles(): Promise<StorageProfile[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readonly');
      const store = transaction.objectStore('profiles');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteProfile(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profiles'], 'readwrite');
      const store = transaction.objectStore('profiles');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Snippet methods
  async saveSnippet(snippet: StorageSnippet): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['snippets'], 'readwrite');
      const store = transaction.objectStore('snippets');
      const request = store.put(snippet);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSnippet(id: string): Promise<StorageSnippet | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['snippets'], 'readonly');
      const store = transaction.objectStore('snippets');
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllSnippets(): Promise<StorageSnippet[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['snippets'], 'readonly');
      const store = transaction.objectStore('snippets');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getSnippetsByCategory(category: string): Promise<StorageSnippet[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['snippets'], 'readonly');
      const store = transaction.objectStore('snippets');
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteSnippet(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['snippets'], 'readwrite');
      const store = transaction.objectStore('snippets');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Log methods
  async saveLog(log: StorageLog): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const request = store.put(log);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLogs(limit: number = 100): Promise<StorageLog[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const index = store.index('timestamp');
      const request = index.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const logs = request.result || [];
        // Sort by timestamp descending and limit
        const sortedLogs = logs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
        resolve(sortedLogs);
      };
    });
  }

  async clearLogs(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Chrome storage wrapper for settings and rules
export class ChromeStorage {
  async getSettings(): Promise<StorageSettings> {
    const result = await chrome.storage.local.get(['settings']);
    return result.settings || {
      aiAssist: false,
      hotkey: 'Alt+A',
      allowlist: [
        'boards.greenhouse.io',
        'jobs.lever.co',
        '*.myworkdayjobs.com',
        '*.ashbyhq.com'
      ]
    };
  }

  async saveSettings(settings: StorageSettings): Promise<void> {
    await chrome.storage.local.set({ settings });
  }

  async getActiveProfileId(): Promise<string | null> {
    const result = await chrome.storage.local.get(['activeProfileId']);
    return result.activeProfileId || null;
  }

  async setActiveProfileId(id: string | null): Promise<void> {
    await chrome.storage.local.set({ activeProfileId: id });
  }

  async getRules(domain: string): Promise<StorageRule[]> {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result.rules || {};
    return rules[domain] || [];
  }

  async saveRule(rule: StorageRule): Promise<void> {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result.rules || {};
    
    if (!rules[rule.domain]) {
      rules[rule.domain] = [];
    }
    
    rules[rule.domain].push(rule);
    await chrome.storage.local.set({ rules });
  }

  async deleteRule(ruleId: string, domain: string): Promise<void> {
    const result = await chrome.storage.local.get(['rules']);
    const rules = result.rules || {};
    
    if (rules[domain]) {
      rules[domain] = rules[domain].filter((rule: StorageRule) => rule.id !== ruleId);
      await chrome.storage.local.set({ rules });
    }
  }
}

// Combined storage manager
export class StorageManager {
  private profileStorage = new ProfileStorage();
  private chromeStorage = new ChromeStorage();

  async init(): Promise<void> {
    await this.profileStorage.init();
  }

  // Profile methods
  async saveProfile(profile: StorageProfile): Promise<void> {
    return this.profileStorage.saveProfile(profile);
  }

  async getProfile(id: string): Promise<StorageProfile | null> {
    return this.profileStorage.getProfile(id);
  }

  async getAllProfiles(): Promise<StorageProfile[]> {
    return this.profileStorage.getAllProfiles();
  }

  async deleteProfile(id: string): Promise<void> {
    return this.profileStorage.deleteProfile(id);
  }

  async getActiveProfile(): Promise<StorageProfile | null> {
    const activeId = await this.chromeStorage.getActiveProfileId();
    if (!activeId) return null;
    return this.getProfile(activeId);
  }

  async setActiveProfile(id: string | null): Promise<void> {
    await this.chromeStorage.setActiveProfileId(id);
  }

  // Settings methods
  async getSettings(): Promise<StorageSettings> {
    return this.chromeStorage.getSettings();
  }

  async saveSettings(settings: StorageSettings): Promise<void> {
    return this.chromeStorage.saveSettings(settings);
  }

  // Rules methods
  async getRules(domain: string): Promise<StorageRule[]> {
    return this.chromeStorage.getRules(domain);
  }

  async saveRule(rule: StorageRule): Promise<void> {
    return this.chromeStorage.saveRule(rule);
  }

  async deleteRule(ruleId: string, domain: string): Promise<void> {
    return this.chromeStorage.deleteRule(ruleId, domain);
  }

  // Snippet methods
  async saveSnippet(snippet: StorageSnippet): Promise<void> {
    return this.profileStorage.saveSnippet(snippet);
  }

  async getSnippet(id: string): Promise<StorageSnippet | null> {
    return this.profileStorage.getSnippet(id);
  }

  async getAllSnippets(): Promise<StorageSnippet[]> {
    return this.profileStorage.getAllSnippets();
  }

  async getSnippetsByCategory(category: string): Promise<StorageSnippet[]> {
    return this.profileStorage.getSnippetsByCategory(category);
  }

  async deleteSnippet(id: string): Promise<void> {
    return this.profileStorage.deleteSnippet(id);
  }

  // Log methods
  async saveLog(log: StorageLog): Promise<void> {
    return this.profileStorage.saveLog(log);
  }

  async getLogs(limit?: number): Promise<StorageLog[]> {
    return this.profileStorage.getLogs(limit);
  }

  async clearLogs(): Promise<void> {
    return this.profileStorage.clearLogs();
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.profileStorage.clearLogs();
    // Note: We don't clear profiles and snippets by default
    // User can manually delete them if needed
  }

  async exportData(): Promise<{
    profiles: StorageProfile[];
    snippets: StorageSnippet[];
    settings: StorageSettings;
    rules: Record<string, StorageRule[]>;
  }> {
    const [profiles, snippets, settings] = await Promise.all([
      this.getAllProfiles(),
      this.getAllSnippets(),
      this.getSettings()
    ]);

    // Get rules for all domains
    const rules: Record<string, StorageRule[]> = {};
    const domains = ['boards.greenhouse.io', 'jobs.lever.co', '*.myworkdayjobs.com', '*.ashbyhq.com'];
    
    for (const domain of domains) {
      rules[domain] = await this.getRules(domain);
    }

    return {
      profiles,
      snippets,
      settings,
      rules
    };
  }
}

// Export singleton instance
export const storage = new StorageManager();
