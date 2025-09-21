# PDR — Local-First Job Application Autofill Extension (v1.1)

## 0) Doc Meta
- **Owner:** <OWNER_NAME>
- **Status:** Draft v1.1
- **Last updated:** 2025-09-21
- **Reviewers:** —

> Note: This document intentionally avoids any personally identifiable information (PII). Use placeholders like `<FULL_NAME>`, `<EMAIL>` in examples.

---

## 1) Summary
A privacy-first browser extension that **autofills job application forms** (Greenhouse, Lever, Workday, Ashby, etc.) using a **user-uploaded JSON profile** (stored locally). It provides one-click fill, a review panel, per-domain rules, and two new features:
1) **Copy Prompt**: a one-click button to copy an **LLM-friendly prompt template** to the clipboard so users can generate a compliant Profile JSON with *any* LLM (no network calls by the extension).
2) **On-Focus Suggestions**: when the user focuses an input, a lightweight suggestion tool proposes values/snippets from the local profile and templates.

No servers, no tracking, local-first by default.

---

## 2) Goals & Non-Goals
### Goals
- Import/validate a **Profile JSON** and store it **locally** (no cloud).
- Detect fields on common ATS pages and **autofill** reliably.
- Offer a **Preview/Review** panel (diffs, quick edits, undo).
- Allow **per-domain rules** and **user overrides** that persist locally.
- Support **multiple profiles** with a quick switcher.
- Local **audit log** (what was filled, where, when).
- **Copy Prompt** button that copies an LLM prompt template to the clipboard.
- **On-Focus Suggestions** with inline pickers and quick templates/snippets.

### Non-Goals (v1.1)
- Automatic CV/PDF/Docx parsing.
- File uploads (CV, attachments).
- Cloud sync or remote storage.
- Calling any LLM API directly (the Copy Prompt is clipboard-only).

---

## 3) Users & Use Cases
**Primary user:** candidates who apply frequently and value speed & privacy.

**Key scenarios**
- Fill standard contact fields + links across ATS platforms in one click.
- Maintain multiple profiles (e.g., “US Remote”, “EU”, “Startup-focused”).
- Use short **answer snippets** (visa, availability, time zone) via variables.
- Generate/refresh profile data using any LLM by pasting the **copied prompt** and then importing the produced JSON.
- Get **inline suggestions** when focusing fields (e.g., select between multiple phone formats or a tailored cover letter snippet).

---

## 4) Requirements
### Functional
- ✅ Import **Profile JSON** (schema v1) with validation + errors.
- ✅ Store profiles in **IndexedDB**; set one as **Active**.
- ✅ Content script: scan → match → fill; dispatch input/change/blur.
- ✅ **Preview** on first visit to a domain; **Undo** and **Edit** inline.
- ✅ Per-domain **rules pack** (Greenhouse, Lever, Workday, Ashby).
- ✅ User **override rules** (selectors → schema fields) per domain.
- ✅ **Hotkey** (default `Alt+A`) and toolbar button.
- ✅ **Copy Prompt** button in Options UI (copies LLM prompt template).
- ✅ **On-Focus Suggestions**: show a suggestion popover near the focused input with candidate values/snippets derived from the active profile and templates.

### Non-Functional
- **Privacy:** local-only; zero outbound requests by default.
- **Reliability:** ≥90% fill success on seed ATS pages for scoped fields.
- **Performance:** fill <1s on typical forms (p75); on-focus popover <150ms.
- **Compatibility:** Chromium MV3 (latest Chrome/Edge).
- **Accessibility:** keyboard operable panel and popovers; ARIA roles.

---

## 5) Success Metrics (local, opt-in)
- Fill success rate per domain.
- Manual edits after autofill.
- Time saved (estimated).
- **Prompt usage rate** (Copy Prompt button clicks).
- **Suggestion acceptance rate** (on-focus picks vs dismissals).

---

## 6) Scope of Fields (v1.1)
- Basics: first/last/full name, email, phone, city/region/country.
- Links: LinkedIn, GitHub, website/portfolio, Twitter/X.
- Short answers: work authorization, relocation, time zone, notice period.
- Cover letter textarea (template string, variables).

**Out of scope v1.1:** file uploads, cross-origin iframes that block script access.

---

## 7) Profile JSON — Schema (v1) (PII-free example)
```json
{
  "version": "1",
  "basics": {
    "fullName": "<FULL_NAME>",
    "firstName": "<FIRST_NAME>",
    "lastName": "<LAST_NAME>",
    "email": "<EMAIL>",
    "phone": "<PHONE>",
    "location": { "city": "<CITY>", "region": "<REGION>", "country": "<COUNTRY>" },
    "links": {
      "linkedin": "<LINKEDIN_URL>",
      "github": "<GITHUB_URL>",
      "website": "<WEBSITE_URL>",
      "portfolio": "<PORTFOLIO_URL>",
      "twitter": "<TWITTER_URL>"
    }
  },
  "work": [
    {
      "company": "<COMPANY>",
      "title": "<TITLE>",
      "start": "<YYYY-MM>",
      "end": null,
      "location": "<CITY_COUNTRY>",
      "summary": "<ONE_LINE_SUMMARY>",
      "highlights": ["<METRIC_1>", "<METRIC_2>"]
    }
  ],
  "education": [{ "school": "<SCHOOL>", "degree": "<DEGREE>", "start": "<YYYY-MM>", "end": null }],
  "answers": {
    "workAuthorizationUS": "<YES_NO_OR_TEXT>",
    "relocation": "<YES_NO_OR_TEXT>",
    "remoteTimezone": "<TZ_STRING>",
    "noticePeriodDays": 15
  },
  "custom": {
    "visa": "<VISA_STATUS>",
    "salaryUSD": "<OPEN_OR_RANGE>"
  }
}
```
- **Validation:** strict types; allow `fullName` or {firstName,lastName}; date strings `YYYY-MM`.

---

## 8) System Design
### MV3 Components
- **Content Script**: DOM scan, candidate extraction, overlay UI, **on-focus suggestions**.
- **Background Service Worker**: rule engine, profile access, messaging.
- **Options Page**: import/export, profiles, rules editor, settings, **Copy Prompt**.
- **Storage**: IndexedDB (profiles, rules, logs), `chrome.storage` for small prefs.

### Data Flow
1. User triggers **Autofill** → content script collects field candidates (label/placeholder/name/id/aria/data-*).
2. Background loads **Active Profile** + **Domain Rules** → returns field assignments + confidence.
3. Content script **fills**, dispatches `input/change/blur`, shows **Review Panel**.
4. **On-Focus Suggestions**: when an input gains focus, content script queries the suggestion engine for candidate values/snippets; user can accept with Enter/click or open a “More…” menu.
5. **Copy Prompt**: Options page button copies an LLM prompt template to clipboard (no network). User pastes it into any LLM, gets JSON, and imports it.

---

## 9) Field-Mapping Engine
**Priority stack**
1. **Per-domain rules** (CSS selectors/XPath).
2. **Token match** on label/placeholder.
3. **Name/id patterns**.
4. **Fallback prompt** to user; cache overrides.

**Transforms**
- Name split/merge; phone normalization; date formatting; country synonyms.
- Radios/checkboxes: fuzzy text match.
- Dropdowns: normalized option matching.

**Anti-breakage**
- Shadow DOM traversal; same-origin iframes; re-render debounce.
- SPA frameworks: set DOM property then fire events.

---

## 10) Rules Pack (Seed)
- **Greenhouse** `boards.greenhouse.io`
- **Lever** `jobs.lever.co`
- **Workday** `*.myworkdayjobs.com`
- **Ashby** `*.ashbyhq.com`

**Rule format**
```json
{
  "domain": "boards.greenhouse.io",
  "rules": [
    { "field": "basics.fullName", "selector": "input[name='applicant.name']" },
    { "field": "basics.email", "selector": "input[type='email']" },
    { "field": "basics.phone", "selector": "input[type='tel'], input[name*='phone']" },
    { "field": "basics.links.linkedin", "selector": "input[name*='linkedin']" }
  ]
}
```

---

## 11) UX Spec
### Global
- **Activation:** Toolbar button + `Alt+A`.
- **First-time on domain:** **Preview** (no write) → **Confirm** to apply.
- **Review Panel:** right drawer with Mapped (✔︎), Unmapped (⚠︎), Conflicts; inline edits; **Apply/Undo**; profile switcher.

### Copy Prompt (Options Page)
- Button: **Copy LLM Prompt** → copies a **safe, PII-free template** with placeholders.
- Toast: “Prompt copied. Paste into your preferred LLM, review, then import JSON here.”

**Prompt Template (copied to clipboard)**
```
You are generating a local-only JSON profile for a job-application autofill extension.
Output valid JSON only, matching this schema (no comments):

{
  "version": "1",
  "basics": {
    "fullName": "<FULL_NAME>",
    "firstName": "<FIRST_NAME>",
    "lastName": "<LAST_NAME>",
    "email": "<EMAIL>",
    "phone": "<PHONE>",
    "location": { "city": "<CITY>", "region": "<REGION>", "country": "<COUNTRY>" },
    "links": { "linkedin": "<LINKEDIN_URL>", "github": "<GITHUB_URL>", "website": "<WEBSITE_URL>", "portfolio": "<PORTFOLIO_URL>", "twitter": "<TWITTER_URL>" }
  },
  "work": [
    { "company": "<COMPANY>", "title": "<TITLE>", "start": "<YYYY-MM>", "end": null, "location": "<CITY_COUNTRY>", "summary": "<ONE_LINE_SUMMARY>", "highlights": ["<METRIC_1>", "<METRIC_2>"] }
  ],
  "education": [{ "school": "<SCHOOL>", "degree": "<DEGREE>", "start": "<YYYY-MM>", "end": null }],
  "answers": { "workAuthorizationUS": "<YES_NO_OR_TEXT>", "relocation": "<YES_NO_OR_TEXT>", "remoteTimezone": "<TZ_STRING>", "noticePeriodDays": 15 },
  "custom": { "visa": "<VISA_STATUS>", "salaryUSD": "<OPEN_OR_RANGE>" }
}

Ensure dates are 'YYYY-MM', URLs are absolute, and values are realistic. Do not include comments or trailing commas.
```

### On-Focus Suggestions (Content Script)
- When an input gets focus:
  - Show a **popover** anchored to the input with up to 3 suggestions:
    1. Best match from profile (e.g., `<EMAIL>`).
    2. Alternate formatting (e.g., `+<COUNTRY_CODE> <PHONE>` vs local format).
    3. A **snippet** option (e.g., “Availability: `<DATE_RANGE>`” if textarea).
- Keyboard: `ArrowUp/Down` to navigate; `Enter` to accept; `Esc` to dismiss.
- Mouse: click to accept; “More…” opens snippet library with variables.
- Privacy: all suggestions are evaluated locally; no remote calls.

---

## 12) Privacy, Security, Compliance
- **Local-only** by default; the extension never sends your data to servers.
- **Copy Prompt** only writes to clipboard; it does not read it.
- **Domain allowlist**; per-site ON/OFF switch.
- **Panic wipe**: clears IndexedDB and stored prefs.
- **Transparent audit log** (local).

---

## 13) Testing Plan
- **Unit**: schema validation (zod), mapping utilities, suggestion ranking.
- **E2E**: Playwright with HTML fixtures per ATS; keyboard a11y tests for popovers.
- **Regression**: selector drift snapshots; on-focus timing budget (<150ms p75).
- **Manual**: masked inputs, SPA re-renders, clipboard permissions (Copy Prompt).

---

## 14) Milestones & Timeline
- **M0 — Scaffold**: MV3 skeleton, TS, IndexedDB wrapper, Options shell.
- **M1 — JSON Import & Storage**: zod schema, import/validation, multi-profile.
- **M2 — Core Autofill**: DOM scanner, mapping v1, events, Review Panel, Undo.
- **M3 — Rules Pack v1**: Greenhouse & Lever; Workday & Ashby core; overrides.
- **M4 — Suggestions**: on-focus popover, snippet library, ranking, a11y.
- **M5 — Copy Prompt**: clipboard action, template, tests, docs.
- **M6 — Polish**: shadow DOM/iframes, metrics, accessibility pass.

*DoD (v1.1):* ≥90% success on seed ATS; suggestions pop in <150ms; Copy Prompt works across target browsers.

---

## 15) Risks & Mitigations
- **ATS markup drift** → fixture tests; user overrides; local telemetry.
- **Iframe isolation** → detect, inform, guide manual entry.
- **Masked inputs/validators** → simulated typing fallback; format adapters.
- **Clipboard permissions UX** → offer manual copy fallback (selectable textarea).

---

## 16) Open Questions
- Should snippets support markdown or plain text only in v1.1?
- Add per-field **confidence** indicator to suggestion popover?
- Provide simple **transform toggles** (e.g., phone E.164 vs local) in the popover?

---

## 17) Appendix — Acceptance Criteria (Examples)
- Copy Prompt button places the full template on clipboard; a toast confirms success.
- Focusing an email field shows a popover with `<EMAIL>` as the first suggestion; `Enter` inserts it and fires `input/change` events.
- On `boards.greenhouse.io/*`, **Autofill** fills mapped fields, opens Review Panel, and supports **Undo**.
- First-time domain flow shows **Preview** mode and requires **Confirm** before writing.
