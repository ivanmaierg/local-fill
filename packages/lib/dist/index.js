"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ChromeStorage: () => ChromeStorage,
  ProfileManager: () => ProfileManager,
  ProfileSchema: () => ProfileSchema,
  ProfileStorage: () => ProfileStorage,
  ProfileValidator: () => ProfileValidator,
  StorageManager: () => StorageManager,
  createEmptyProfile: () => createEmptyProfile,
  llmPromptTemplate: () => llmPromptTemplate,
  profileManager: () => profileManager,
  profileValidator: () => profileValidator,
  sampleProfile: () => sampleProfile,
  sanitizeProfile: () => sanitizeProfile,
  storage: () => storage,
  validateAndSanitizeProfile: () => validateAndSanitizeProfile,
  validateProfile: () => validateProfile
});
module.exports = __toCommonJS(index_exports);

// src/profile.schema.ts
var import_zod = require("zod");
var ProfileSchema = import_zod.z.object({
  version: import_zod.z.literal("1"),
  basics: import_zod.z.object({
    fullName: import_zod.z.string().min(1, "Full name is required").max(100, "Full name too long"),
    firstName: import_zod.z.string().min(1, "First name is required").max(50, "First name too long"),
    lastName: import_zod.z.string().min(1, "Last name is required").max(50, "Last name too long"),
    email: import_zod.z.string().email("Invalid email format").max(100, "Email too long"),
    phone: import_zod.z.string().min(1, "Phone number is required").max(20, "Phone number too long"),
    location: import_zod.z.object({
      city: import_zod.z.string().min(1, "City is required").max(50, "City name too long"),
      region: import_zod.z.string().min(1, "Region/State is required").max(50, "Region name too long"),
      country: import_zod.z.string().min(1, "Country is required").max(50, "Country name too long")
    }),
    links: import_zod.z.object({
      linkedin: import_zod.z.string().url("Invalid LinkedIn URL").optional().or(import_zod.z.literal("")),
      github: import_zod.z.string().url("Invalid GitHub URL").optional().or(import_zod.z.literal("")),
      website: import_zod.z.string().url("Invalid website URL").optional().or(import_zod.z.literal("")),
      portfolio: import_zod.z.string().url("Invalid portfolio URL").optional().or(import_zod.z.literal("")),
      twitter: import_zod.z.string().url("Invalid Twitter URL").optional().or(import_zod.z.literal(""))
    })
  }),
  work: import_zod.z.array(import_zod.z.object({
    company: import_zod.z.string().min(1, "Company name is required").max(100, "Company name too long"),
    title: import_zod.z.string().min(1, "Job title is required").max(100, "Job title too long"),
    start: import_zod.z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
    end: import_zod.z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").nullable(),
    location: import_zod.z.string().min(1, "Work location is required").max(100, "Location too long"),
    summary: import_zod.z.string().min(1, "Work summary is required").max(500, "Summary too long"),
    highlights: import_zod.z.array(import_zod.z.string().max(200, "Highlight too long")).max(10, "Too many highlights")
  })).max(10, "Too many work experiences"),
  education: import_zod.z.array(import_zod.z.object({
    school: import_zod.z.string().min(1, "School name is required").max(100, "School name too long"),
    degree: import_zod.z.string().min(1, "Degree is required").max(100, "Degree name too long"),
    start: import_zod.z.string().regex(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
    end: import_zod.z.string().regex(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format").nullable()
  })).max(5, "Too many education entries"),
  answers: import_zod.z.object({
    workAuthorizationUS: import_zod.z.string().min(1, "Work authorization status is required").max(100, "Answer too long"),
    relocation: import_zod.z.string().min(1, "Relocation preference is required").max(100, "Answer too long"),
    remoteTimezone: import_zod.z.string().min(1, "Remote timezone is required").max(50, "Timezone too long"),
    noticePeriodDays: import_zod.z.number().int().min(0, "Notice period cannot be negative").max(365, "Notice period too long")
  }),
  custom: import_zod.z.record(import_zod.z.string().max(50, "Custom field name too long"), import_zod.z.string().max(500, "Custom field value too long"))
});
var validateProfile = (data) => {
  try {
    const profile = ProfileSchema.parse(data);
    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        errors: error.errors
      };
    }
    return { success: false, error: "Unknown validation error" };
  }
};
var sanitizeProfile = (data) => {
  if (typeof data !== "object" || data === null) {
    return data;
  }
  const sanitized = { ...data };
  const sanitizeString = (str) => {
    if (typeof str !== "string") return "";
    return str.trim().replace(/[<>]/g, "");
  };
  if (sanitized.basics) {
    sanitized.basics = {
      ...sanitized.basics,
      fullName: sanitizeString(sanitized.basics.fullName),
      firstName: sanitizeString(sanitized.basics.firstName),
      lastName: sanitizeString(sanitized.basics.lastName),
      email: sanitizeString(sanitized.basics.email).toLowerCase(),
      phone: sanitizeString(sanitized.basics.phone),
      location: {
        city: sanitizeString(sanitized.basics.location?.city),
        region: sanitizeString(sanitized.basics.location?.region),
        country: sanitizeString(sanitized.basics.location?.country)
      },
      links: {
        linkedin: sanitizeString(sanitized.basics.links?.linkedin),
        github: sanitizeString(sanitized.basics.links?.github),
        website: sanitizeString(sanitized.basics.links?.website),
        portfolio: sanitizeString(sanitized.basics.links?.portfolio),
        twitter: sanitizeString(sanitized.basics.links?.twitter)
      }
    };
  }
  if (Array.isArray(sanitized.work)) {
    sanitized.work = sanitized.work.map((work) => ({
      ...work,
      company: sanitizeString(work.company),
      title: sanitizeString(work.title),
      location: sanitizeString(work.location),
      summary: sanitizeString(work.summary),
      highlights: Array.isArray(work.highlights) ? work.highlights.map((h) => sanitizeString(h)).filter(Boolean) : []
    }));
  }
  if (Array.isArray(sanitized.education)) {
    sanitized.education = sanitized.education.map((edu) => ({
      ...edu,
      school: sanitizeString(edu.school),
      degree: sanitizeString(edu.degree)
    }));
  }
  if (sanitized.answers) {
    sanitized.answers = {
      workAuthorizationUS: sanitizeString(sanitized.answers.workAuthorizationUS),
      relocation: sanitizeString(sanitized.answers.relocation),
      remoteTimezone: sanitizeString(sanitized.answers.remoteTimezone),
      noticePeriodDays: typeof sanitized.answers.noticePeriodDays === "number" ? Math.max(0, Math.min(365, sanitized.answers.noticePeriodDays)) : 0
    };
  }
  if (sanitized.custom && typeof sanitized.custom === "object") {
    const sanitizedCustom = {};
    for (const [key, value] of Object.entries(sanitized.custom)) {
      if (typeof key === "string" && typeof value === "string") {
        sanitizedCustom[sanitizeString(key)] = sanitizeString(value);
      }
    }
    sanitized.custom = sanitizedCustom;
  }
  return sanitized;
};
var createEmptyProfile = () => {
  return {
    version: "1",
    basics: {
      fullName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: {
        city: "",
        region: "",
        country: ""
      },
      links: {
        linkedin: "",
        github: "",
        website: "",
        portfolio: "",
        twitter: ""
      }
    },
    work: [],
    education: [],
    answers: {
      workAuthorizationUS: "",
      relocation: "",
      remoteTimezone: "",
      noticePeriodDays: 0
    },
    custom: {}
  };
};
var validateAndSanitizeProfile = (data) => {
  const sanitized = sanitizeProfile(data);
  return validateProfile(sanitized);
};
var sampleProfile = {
  version: "1",
  basics: {
    fullName: "<FULL_NAME>",
    firstName: "<FIRST_NAME>",
    lastName: "<LAST_NAME>",
    email: "<EMAIL>",
    phone: "<PHONE>",
    location: {
      city: "<CITY>",
      region: "<REGION>",
      country: "<COUNTRY>"
    },
    links: {
      linkedin: "<LINKEDIN_URL>",
      github: "<GITHUB_URL>",
      website: "<WEBSITE_URL>",
      portfolio: "<PORTFOLIO_URL>",
      twitter: "<TWITTER_URL>"
    }
  },
  work: [
    {
      company: "<COMPANY>",
      title: "<TITLE>",
      start: "2020-01",
      end: null,
      location: "<CITY_COUNTRY>",
      summary: "<ONE_LINE>",
      highlights: ["<METRIC_1>", "<METRIC_2>"]
    }
  ],
  education: [
    {
      school: "<SCHOOL>",
      degree: "<DEGREE>",
      start: "2016-09",
      end: "2020-05"
    }
  ],
  answers: {
    workAuthorizationUS: "<YES_NO_OR_TEXT>",
    relocation: "<YES_NO_OR_TEXT>",
    remoteTimezone: "<TZ>",
    noticePeriodDays: 15
  },
  custom: {
    visa: "<VISA_STATUS>",
    salaryUSD: "<OPEN_OR_RANGE>"
  }
};
var llmPromptTemplate = `You are generating a local-only JSON profile for a job application autofill extension. This profile will be stored locally on the user's device and never sent to any servers.

Please generate a complete profile JSON following this exact schema:

\`\`\`json
{
  "version": "1",
  "basics": {
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "location": {
      "city": "San Francisco",
      "region": "CA",
      "country": "USA"
    },
    "links": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.com",
      "portfolio": "https://portfolio.johndoe.com",
      "twitter": "https://twitter.com/johndoe"
    }
  },
  "work": [
    {
      "company": "Tech Company Inc",
      "title": "Senior Software Engineer",
      "start": "2020-01",
      "end": null,
      "location": "San Francisco, CA",
      "summary": "Led development of scalable web applications",
      "highlights": [
        "Increased system performance by 40%",
        "Mentored 3 junior developers"
      ]
    }
  ],
  "education": [
    {
      "school": "University of California",
      "degree": "Bachelor of Science in Computer Science",
      "start": "2016-09",
      "end": "2020-05"
    }
  ],
  "answers": {
    "workAuthorizationUS": "Yes",
    "relocation": "Yes",
    "remoteTimezone": "PST",
    "noticePeriodDays": 14
  },
  "custom": {
    "visa": "Authorized to work",
    "salaryUSD": "Open"
  }
}
\`\`\`

Important guidelines:
- Use real information, not placeholders
- Ensure all required fields are filled
- Dates must be in YYYY-MM format
- URLs must be valid and complete
- Keep summaries and highlights concise but informative
- Custom fields are optional but can include additional relevant information

Generate the profile now:`;

// src/storage.ts
var ProfileStorage = class {
  dbName = "local-fill-profiles";
  version = 1;
  db = null;
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("profiles")) {
          const store = db.createObjectStore("profiles", { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("rules")) {
          const store = db.createObjectStore("rules", { keyPath: "id" });
          store.createIndex("domain", "domain", { unique: false });
        }
        if (!db.objectStoreNames.contains("snippets")) {
          const store = db.createObjectStore("snippets", { keyPath: "id" });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("logs")) {
          const store = db.createObjectStore("logs", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("action", "action", { unique: false });
          store.createIndex("domain", "domain", { unique: false });
        }
      };
    });
  }
  async saveProfile(profile) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      const request = store.put(profile);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async getProfile(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["profiles"], "readonly");
      const store = transaction.objectStore("profiles");
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  async getAllProfiles() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["profiles"], "readonly");
      const store = transaction.objectStore("profiles");
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  async deleteProfile(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["profiles"], "readwrite");
      const store = transaction.objectStore("profiles");
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  // Snippet methods
  async saveSnippet(snippet) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["snippets"], "readwrite");
      const store = transaction.objectStore("snippets");
      const request = store.put(snippet);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async getSnippet(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["snippets"], "readonly");
      const store = transaction.objectStore("snippets");
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
  async getAllSnippets() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["snippets"], "readonly");
      const store = transaction.objectStore("snippets");
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  async getSnippetsByCategory(category) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["snippets"], "readonly");
      const store = transaction.objectStore("snippets");
      const index = store.index("category");
      const request = index.getAll(category);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }
  async deleteSnippet(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["snippets"], "readwrite");
      const store = transaction.objectStore("snippets");
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  // Log methods
  async saveLog(log) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");
      const request = store.put(log);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async getLogs(limit = 100) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["logs"], "readonly");
      const store = transaction.objectStore("logs");
      const index = store.index("timestamp");
      const request = index.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const logs = request.result || [];
        const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
        resolve(sortedLogs);
      };
    });
  }
  async clearLogs() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
};
var ChromeStorage = class {
  async getSettings() {
    const result = await chrome.storage.local.get(["settings"]);
    return result.settings || {
      aiAssist: false,
      hotkey: "Alt+A",
      allowlist: [
        "boards.greenhouse.io",
        "jobs.lever.co",
        "*.myworkdayjobs.com",
        "*.ashbyhq.com"
      ]
    };
  }
  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }
  async getActiveProfileId() {
    const result = await chrome.storage.local.get(["activeProfileId"]);
    return result.activeProfileId || null;
  }
  async setActiveProfileId(id) {
    await chrome.storage.local.set({ activeProfileId: id });
  }
  async getRules(domain) {
    const result = await chrome.storage.local.get(["rules"]);
    const rules = result.rules || {};
    return rules[domain] || [];
  }
  async saveRule(rule) {
    const result = await chrome.storage.local.get(["rules"]);
    const rules = result.rules || {};
    if (!rules[rule.domain]) {
      rules[rule.domain] = [];
    }
    rules[rule.domain].push(rule);
    await chrome.storage.local.set({ rules });
  }
  async deleteRule(ruleId, domain) {
    const result = await chrome.storage.local.get(["rules"]);
    const rules = result.rules || {};
    if (rules[domain]) {
      rules[domain] = rules[domain].filter((rule) => rule.id !== ruleId);
      await chrome.storage.local.set({ rules });
    }
  }
};
var StorageManager = class {
  profileStorage = new ProfileStorage();
  chromeStorage = new ChromeStorage();
  async init() {
    await this.profileStorage.init();
  }
  // Profile methods
  async saveProfile(profile) {
    return this.profileStorage.saveProfile(profile);
  }
  async getProfile(id) {
    return this.profileStorage.getProfile(id);
  }
  async getAllProfiles() {
    return this.profileStorage.getAllProfiles();
  }
  async deleteProfile(id) {
    return this.profileStorage.deleteProfile(id);
  }
  async getActiveProfile() {
    const activeId = await this.chromeStorage.getActiveProfileId();
    if (!activeId) return null;
    return this.getProfile(activeId);
  }
  async setActiveProfile(id) {
    await this.chromeStorage.setActiveProfileId(id);
  }
  // Settings methods
  async getSettings() {
    return this.chromeStorage.getSettings();
  }
  async saveSettings(settings) {
    return this.chromeStorage.saveSettings(settings);
  }
  // Rules methods
  async getRules(domain) {
    return this.chromeStorage.getRules(domain);
  }
  async saveRule(rule) {
    return this.chromeStorage.saveRule(rule);
  }
  async deleteRule(ruleId, domain) {
    return this.chromeStorage.deleteRule(ruleId, domain);
  }
  // Snippet methods
  async saveSnippet(snippet) {
    return this.profileStorage.saveSnippet(snippet);
  }
  async getSnippet(id) {
    return this.profileStorage.getSnippet(id);
  }
  async getAllSnippets() {
    return this.profileStorage.getAllSnippets();
  }
  async getSnippetsByCategory(category) {
    return this.profileStorage.getSnippetsByCategory(category);
  }
  async deleteSnippet(id) {
    return this.profileStorage.deleteSnippet(id);
  }
  // Log methods
  async saveLog(log) {
    return this.profileStorage.saveLog(log);
  }
  async getLogs(limit) {
    return this.profileStorage.getLogs(limit);
  }
  async clearLogs() {
    return this.profileStorage.clearLogs();
  }
  // Utility methods
  async clearAllData() {
    await this.profileStorage.clearLogs();
  }
  async exportData() {
    const [profiles, snippets, settings] = await Promise.all([
      this.getAllProfiles(),
      this.getAllSnippets(),
      this.getSettings()
    ]);
    const rules = {};
    const domains = ["boards.greenhouse.io", "jobs.lever.co", "*.myworkdayjobs.com", "*.ashbyhq.com"];
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
};
var storage = new StorageManager();

// src/profile.validator.ts
var ProfileValidator = class {
  // Validate profile with detailed error reporting
  validateProfile(data) {
    return validateAndSanitizeProfile(data);
  }
  // Validate profile with custom rules
  validateProfileWithCustomRules(data) {
    const validation = this.validateProfile(data);
    if (!validation.success) {
      return {
        success: false,
        errors: this.formatValidationErrors(validation.errors || [])
      };
    }
    const customValidation = this.validateCustomRules(validation.data);
    if (!customValidation.success) {
      return {
        success: false,
        errors: customValidation.errors || []
      };
    }
    return {
      success: true,
      data: validation.data,
      warnings: customValidation.warnings || []
    };
  }
  // Format Zod errors into user-friendly format
  formatValidationErrors(zodErrors) {
    return zodErrors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
      value: error.input
    }));
  }
  // Custom validation rules beyond schema
  validateCustomRules(profile) {
    const errors = [];
    const warnings = [];
    const placeholderChecks = [
      { field: "basics.fullName", value: profile.basics.fullName, placeholder: "<FULL_NAME>" },
      { field: "basics.email", value: profile.basics.email, placeholder: "<EMAIL>" },
      { field: "basics.phone", value: profile.basics.phone, placeholder: "<PHONE>" }
    ];
    placeholderChecks.forEach(({ field, value, placeholder }) => {
      if (value.includes(placeholder)) {
        warnings.push(`${field} contains placeholder value: ${placeholder}`);
      }
    });
    if (profile.basics.email && !profile.basics.email.includes("@")) {
      errors.push({
        field: "basics.email",
        message: "Email must contain @ symbol",
        value: profile.basics.email
      });
    }
    profile.work.forEach((work, index) => {
      if (work.start && work.end) {
        const startDate = /* @__PURE__ */ new Date(work.start + "-01");
        const endDate = /* @__PURE__ */ new Date(work.end + "-01");
        if (startDate > endDate) {
          errors.push({
            field: `work[${index}].dates`,
            message: "Start date must be before end date",
            value: { start: work.start, end: work.end }
          });
        }
      }
    });
    profile.education.forEach((edu, index) => {
      if (edu.start && edu.end) {
        const startDate = /* @__PURE__ */ new Date(edu.start + "-01");
        const endDate = /* @__PURE__ */ new Date(edu.end + "-01");
        if (startDate > endDate) {
          errors.push({
            field: `education[${index}].dates`,
            message: "Start date must be before end date",
            value: { start: edu.start, end: edu.end }
          });
        }
      }
    });
    if (profile.work.length === 0) {
      warnings.push("No work experience provided");
    }
    if (profile.education.length === 0) {
      warnings.push("No education provided");
    }
    if (profile.answers.noticePeriodDays > 90) {
      warnings.push("Notice period is unusually long (>90 days)");
    }
    return {
      success: errors.length === 0,
      ...errors.length > 0 && { errors },
      ...warnings.length > 0 && { warnings }
    };
  }
  // Sanitize profile data
  sanitizeProfile(data) {
    const sanitizeString = (str) => {
      if (typeof str !== "string") return "";
      return str.trim().replace(/<[^>]*>/g, "").replace(/[<>]/g, "").replace(/\s+/g, " ");
    };
    const sanitizeObject = (obj) => {
      if (typeof obj !== "object" || obj === null) {
        return typeof obj === "string" ? sanitizeString(obj) : obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
      }
      return sanitized;
    };
    return sanitizeObject(data);
  }
  // Validate profile completeness
  validateCompleteness(profile) {
    const missing = [];
    const suggestions = [];
    if (!profile.basics.fullName) missing.push("Full name");
    if (!profile.basics.email) missing.push("Email");
    if (!profile.basics.phone) missing.push("Phone");
    if (!profile.basics.location.city) missing.push("City");
    if (!profile.basics.location.region) missing.push("Region/State");
    if (!profile.basics.location.country) missing.push("Country");
    if (!profile.basics.links.linkedin) suggestions.push("Add LinkedIn profile");
    if (!profile.basics.links.github) suggestions.push("Add GitHub profile");
    if (profile.work.length === 0) {
      missing.push("Work experience");
    } else {
      profile.work.forEach((work, index) => {
        if (!work.summary) suggestions.push(`Add summary for work experience ${index + 1}`);
        if (work.highlights.length === 0) suggestions.push(`Add highlights for work experience ${index + 1}`);
      });
    }
    if (profile.education.length === 0) {
      missing.push("Education");
    }
    if (!profile.answers.workAuthorizationUS) missing.push("Work authorization status");
    if (!profile.answers.relocation) missing.push("Relocation preference");
    if (!profile.answers.remoteTimezone) missing.push("Remote timezone");
    const totalFields = 15;
    const completedFields = totalFields - missing.length;
    const score = Math.round(completedFields / totalFields * 100);
    return { score, missing, suggestions };
  }
  // Get validation summary
  getValidationSummary(profile) {
    const validation = this.validateProfileWithCustomRules(profile);
    const completeness = this.validateCompleteness(profile);
    return {
      isValid: validation.success,
      completeness,
      errors: validation.errors || [],
      warnings: validation.warnings || []
    };
  }
};
var profileValidator = new ProfileValidator();

// src/profile.manager.ts
var ProfileManager = class {
  // Import profile from JSON string
  async importProfile(jsonString, name) {
    try {
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (error) {
        return {
          success: false,
          error: "Invalid JSON format"
        };
      }
      const validation = validateAndSanitizeProfile(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          details: validation.errors
        };
      }
      const profileId = this.generateProfileId();
      const profileName = name || this.generateProfileName(validation.data);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const storageProfile = {
        id: profileId,
        name: profileName,
        data: validation.data,
        createdAt: now,
        updatedAt: now
      };
      await storage.saveProfile(storageProfile);
      return {
        success: true,
        profile: storageProfile
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to import profile",
        details: error
      };
    }
  }
  // Import profile from file
  async importProfileFromFile(file) {
    try {
      const text = await file.text();
      const name = file.name.replace(/\.json$/i, "");
      return this.importProfile(text, name);
    } catch (error) {
      return {
        success: false,
        error: "Failed to read file"
      };
    }
  }
  // Export profile to JSON string
  async exportProfile(profileId) {
    try {
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return {
          success: false,
          error: "Profile not found"
        };
      }
      const jsonString = JSON.stringify(profile.data, null, 2);
      const filename = `${profile.name.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
      return {
        success: true,
        data: jsonString,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to export profile",
        details: error
      };
    }
  }
  // Export all profiles
  async exportAllProfiles() {
    try {
      const profiles = await storage.getAllProfiles();
      const settings = await storage.getSettings();
      const exportData = {
        version: "1.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        profiles: profiles.map((p) => ({
          id: p.id,
          name: p.name,
          data: p.data,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        })),
        settings
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `local-fill-profiles-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      return {
        success: true,
        data: jsonString,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to export profiles",
        details: error
      };
    }
  }
  // Create new profile
  async createProfile(name) {
    try {
      const emptyProfile = createEmptyProfile();
      const profileId = this.generateProfileId();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const storageProfile = {
        id: profileId,
        name,
        data: emptyProfile,
        createdAt: now,
        updatedAt: now
      };
      await storage.saveProfile(storageProfile);
      return {
        success: true,
        profile: storageProfile
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create profile",
        details: error
      };
    }
  }
  // Update profile
  async updateProfile(profileId, profileData) {
    try {
      const validation = validateAndSanitizeProfile(profileData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          details: validation.errors
        };
      }
      const existingProfile = await storage.getProfile(profileId);
      if (!existingProfile) {
        return {
          success: false,
          error: "Profile not found"
        };
      }
      const updatedProfile = {
        ...existingProfile,
        data: validation.data,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await storage.saveProfile(updatedProfile);
      return {
        success: true,
        profile: updatedProfile
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update profile",
        details: error
      };
    }
  }
  // Delete profile
  async deleteProfile(profileId) {
    try {
      await storage.deleteProfile(profileId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete profile"
      };
    }
  }
  // Get LLM prompt template
  getLLMPromptTemplate() {
    return llmPromptTemplate;
  }
  // Copy LLM prompt to clipboard
  async copyLLMPromptToClipboard() {
    try {
      if (!navigator.clipboard) {
        return {
          success: false,
          error: "Clipboard API not available"
        };
      }
      await navigator.clipboard.writeText(this.getLLMPromptTemplate());
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Failed to copy to clipboard"
      };
    }
  }
  // Generate unique profile ID
  generateProfileId() {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // Generate profile name from profile data
  generateProfileName(profile) {
    if (profile.basics.fullName) {
      return `${profile.basics.fullName} Profile`;
    }
    if (profile.basics.firstName && profile.basics.lastName) {
      return `${profile.basics.firstName} ${profile.basics.lastName} Profile`;
    }
    if (profile.basics.email) {
      return `${profile.basics.email} Profile`;
    }
    return `Profile ${Date.now()}`;
  }
  // Validate profile without saving
  validateProfile(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const validation = validateAndSanitizeProfile(data);
      if (validation.success) {
        return {
          success: true,
          profile: validation.data
        };
      } else {
        return {
          success: false,
          error: validation.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Invalid JSON format"
      };
    }
  }
  // Get detailed validation summary for a profile
  getValidationSummary(profile) {
    return profileValidator.getValidationSummary(profile);
  }
  // Validate profile with enhanced rules
  validateProfileWithRules(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return profileValidator.validateProfileWithCustomRules(data);
    } catch (error) {
      return {
        success: false,
        errors: [{
          field: "json",
          message: "Invalid JSON format",
          value: jsonString
        }]
      };
    }
  }
};
var profileManager = new ProfileManager();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChromeStorage,
  ProfileManager,
  ProfileSchema,
  ProfileStorage,
  ProfileValidator,
  StorageManager,
  createEmptyProfile,
  llmPromptTemplate,
  profileManager,
  profileValidator,
  sampleProfile,
  sanitizeProfile,
  storage,
  validateAndSanitizeProfile,
  validateProfile
});
