# Design Doc — Local‑First Job Autofill Extension

## 0) Meta
- **Owner:** <OWNER>
- **Status:** Draft v1
- **Stack:** TypeScript • MV3 • React (Options/Popup/Overlay) • TailwindCSS • shadcn/ui • Vite • Playwright
- **AI:** Chrome Built‑in AI (Prompt API / Summarizer API where available), feature‑gated
- **PII policy:** No real PII in docs or seed data; placeholders only

---

## 1) Product Overview
A privacy‑first browser extension that autofills job application forms from a user‑provided **Profile JSON**. It offers:
- One‑click **Autofill** with preview/undo
- **On‑Focus Suggestions** popover (values/snippets)
- **Copy LLM Prompt** button to generate Profile JSON with any LLM (clipboard only)
- Per‑domain rules (Greenhouse/Lever/Workday/Ashby), user overrides, multiple profiles
- Optional: Chrome Built‑in AI assistance for **label → field** matching and **snippet generation**, gated by availability

---

## 2) Requirements (condensed)
### Functional
0. **One-Command Installation Wizard**: Interactive setup wizard that guides users through installation with a single command execution.
1. Import/validate Profile JSON (schema v1). Store in IndexedDB.
2. Autofill fields with events (input/change/blur).
3. Review Panel: mapped/unmapped, edit inline, undo.
4. On‑Focus Suggestions: popover with top 3 candidates + snippet library.
5. Copy LLM Prompt: copies a PII‑free JSON prompt template.
6. Rules pack (Greenhouse/Lever/Workday/Ashby) + user overrides.
7. Profiles: create, switch, export/import (encrypted optional later).

### Non‑Functional
- Local‑only by default, zero outbound network calls
- ≥90% success on seed ATS; autofill < 1s p75; suggestions pop < 150ms
- A11y: keyboard navigation & ARIA on drawers/popovers

---

## 2a) Feature: One-Command Installation Wizard

### Overview
An interactive setup wizard that enables users to install and configure the extension with a single command, eliminating the complex manual setup process and making the extension accessible to all users regardless of technical background.

### Requirements
- **Single Command Execution**: `curl -fsSL https://get.local-fill.dev | bash` or similar one-liner
- **Interactive Setup Flow**: Guides users through each step with clear prompts
- **Automatic Installation**: Handles browser extension installation automatically
- **Profile Creation**: Optional guided profile creation during setup
- **Cross-Platform Support**: Works on macOS, Linux, and Windows
- **Error Handling**: Graceful failure with helpful error messages
- **Privacy-First**: No data collection during installation

### Installation Flow
1. **Environment Detection**: Check OS, browser availability, permissions
2. **Download Extension**: Fetch the latest release from GitHub
3. **Browser Integration**: Automatically load extension in supported browsers
4. **Initial Configuration**: Set up basic preferences (hotkeys, allowlist)
5. **Profile Setup** (Optional): Guide users to create their first profile
6. **Testing**: Verify installation with a quick test

### Implementation Approach
- **Shell Script**: Cross-platform bash script with fallbacks
- **Web Interface**: Optional web-based wizard for complex configurations
- **Progress Indicators**: Clear progress bars and status updates
- **Rollback Support**: Ability to undo installation if needed
- **Documentation Links**: Integrated help and documentation access

### Success Metrics
- **Setup Completion Rate**: >95% of users successfully complete installation
- **Time to First Use**: <3 minutes from command execution to functional extension
- **User Satisfaction**: >4.5/5 rating for installation experience
- **Support Reduction**: <10% of users need manual installation help

---

## 3) Architecture
```
+--------------------+        +-----------------------+
|  Popup / Toolbar   |        |  Options (React)      |
|  (Trigger Autofill)|        |  Profiles / Rules UI  |
+---------+----------+        +-----------+-----------+
          |                               |
          v                               v
+---------+----------+        +-----------+-----------+
| Content Script     | <----> | Background Service    |
| DOM Scanner / UI   |  msg   | Worker (Rule Engine)  |
+----+-----+----+----+        +-----------+-----------+
     |     |    |                         |
     |     |    +--> IndexedDB (profiles, rules, logs)
     |     |
     |     +------> Feature Gate: Chrome AI APIs (optional)
     |
     +------------> Suggestion Engine (local)
```

### Responsibilities
- **Content script**: DOM scan; candidate extraction; overlay UI (Review Panel, Suggestions popover); event dispatch; retry/debounce; shadow‑DOM/iframe handling (same‑origin only).
- **Background**: rule resolution; profile fetch; transformations; low‑confidence fallback routing; telemetry (local).
- **Options**: Profile JSON import/export; rules editor; prompt copy; settings (allowlist, hotkeys); profiles manager.

---

## 4) Data Model
### Profile JSON (v1) — placeholders only
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
    "links": { "linkedin": "<LINKEDIN_URL>", "github": "<GITHUB_URL>", "website": "<WEBSITE_URL>", "portfolio": "<PORTFOLIO_URL>", "twitter": "<TWITTER_URL>" }
  },
  "work": [ { "company": "<COMPANY>", "title": "<TITLE>", "start": "<YYYY-MM>", "end": null, "location": "<CITY_COUNTRY>", "summary": "<ONE_LINE>", "highlights": ["<METRIC_1>", "<METRIC_2>"] } ],
  "education": [ { "school": "<SCHOOL>", "degree": "<DEGREE>", "start": "<YYYY-MM>", "end": null } ],
  "answers": { "workAuthorizationUS": "<YES_NO_OR_TEXT>", "relocation": "<YES_NO_OR_TEXT>", "remoteTimezone": "<TZ>", "noticePeriodDays": 15 },
  "custom": { "visa": "<VISA_STATUS>", "salaryUSD": "<OPEN_OR_RANGE>" }
}
```

### Rules format (per domain)
```json
{ "domain": "boards.greenhouse.io", "rules": [
  { "field": "basics.fullName", "selector": "input[name='applicant.name']" },
  { "field": "basics.email",    "selector": "input[type='email']" },
  { "field": "basics.phone",    "selector": "input[type='tel'], input[name*='phone']" },
  { "field": "basics.links.linkedin", "selector": "input[name*='linkedin']" }
]}
```

---

## 5) Feature: Copy LLM Prompt
- **UI:** Options page → shadcn `Button` → `navigator.clipboard.writeText(template)`
- **Template:** PII‑free JSON schema with placeholders; single code‑fenced block
- **Notes:** Never read clipboard. Show toast (shadcn `use-toast`) confirming copy.

**Template snippet**
```
You are generating a local-only JSON profile... (schema v1 with placeholders)
```

---

## 6) Feature: On‑Focus Suggestions
- **Trigger:** `focus` or `keydown` in an eligible field
- **Popover (shadcn)**: up to 3 ranked suggestions:
  1. Best profile match (e.g., `<EMAIL>`)
  2. Alternate formatting (e.g., E.164 phone vs local)
  3. Snippet (e.g., availability line for textarea)
- **Keyboard:** Arrow to navigate; Enter to accept; Esc to dismiss
- **Learning:** On accept for unmapped field, offer to save as a rule (domain‑scoped)

---

## 7) Chrome AI Integration (Optional, Feature‑Gated)
### Use cases
- **Label → Canonical Field assist:** When token matching is ambiguous, ask on‑device model to rank likely mappings from candidate labels to schema fields.
- **Snippet drafting:** Generate short, neutral text snippets (e.g., availability sentence) locally.

### Gating logic
- Detect availability safely (try/catch):
  - `window.ai?.createTextSession` (Prompt API)
  - `navigator.summarizer` (Summarizer API)
- Respect user setting: **AI Assist [ON|OFF]** (default OFF). No network calls from extension.

### Example pseudo‑flow
```
if (aiAvailable && settings.aiAssist) {
  const session = await window.ai.createTextSession({ systemPrompt: "You map labels to profile fields" })
  const result = await session.prompt(JSON.stringify({ labels, schemaKeys }))
  // Merge result into ranking; cap impact to tie‑breaker only
}
```

### Safety
- Keep prompts PII‑free; use placeholders or hashed labels
- Timebox requests (abort controller); degrade gracefully

---

## 8) UI System (Tailwind + shadcn)
- **Tokens:** spacing scale, rounded‑2xl cards, subtle shadows, muted palette
- **Components:**
  - `Button`, `Input`, `Label`, `Dialog`, `Drawer`, `Popover`, `Command` (for search), `Toast`
  - Review Panel: `Drawer` + `DataTable` (mapped/unmapped)
  - Suggestions: `Popover` anchored to input rect
- **Accessibility:** Focus rings, `aria-live` updates, trap focus in drawers

---

## 9) Build & Packaging
- MV3 manifest: `storage`, `scripting`, `activeTab`; host permissions for ATS domains; content_scripts on ATS URLs
- Bundler: Vite (TS + React). Separate entries: background, content, options, styles
- CSS: Tailwind JIT, preflight reset; isolate content script styles (shadow root for overlay)
- Shadcn: generate components in `/ui` with Tailwind config

---

## 10) Folder Structure
```
/extension
  /background    // service worker
  /content       // scanners, fillers, overlay UI
  /options       // React app (profiles, rules, settings)
  /ui            // shadcn components
  /lib           // stores, zod schemas, rules engine, ai adapters
  /styles        // tailwind.css
  manifest.json
  vite.config.ts
```

---

## 11) Core Modules
- `lib/profile.schema.ts` (zod)
- `lib/rules.engine.ts` (selectors → fields, precedence)
- `lib/dom.scan.ts` (labels, placeholders, ids, aria, data‑*)
- `lib/fill.run.ts` (set value, dispatch events, masked input helpers)
- `lib/suggest.ts` (ranking, snippets, recent picks)
- `lib/ai.adapters.ts` (feature‑gated Prompt/Summarizer helpers)
- `lib/storage.ts` (IndexedDB + chrome.storage sync for prefs only if needed)

---

## 12) Security & Privacy
- Local‑only; no network calls
- Domain allowlist; big per‑site ON/OFF
- Panic wipe clears IndexedDB
- Audit log stored locally; user‑viewable
- No clipboard reads; only writes for prompt copy

---

## 13) Testing
- Unit: zod schemas; ranking; transformations
- E2E: Playwright on fixture HTML per ATS; keyboard flows; timing budgets
- Regression: selector drift snapshots; visual diffs for overlay

---

## 14) Milestones
- **M0 installation wizard** → Create one-command setup script for easy installation
- M1 scaffold → M2 JSON import → M3 core autofill → M4 rules pack → M5 suggestions → M6 copy‑prompt → M7 polish & a11y

---

## 15) Open Questions
- Allow per‑field AI assist toggles?
- Offer Markdown in snippets or plain text only?
- Provide transform toggles (E.164 phone) directly in suggestion popover?



## 13a) Testing (Playwright details)

### Strategy
- **Unit (Vitest):** schema validation, rules engine, transformers.
- **Integration (Playwright):** run the built MV3 extension against local HTML fixtures for common ATS pages.
- **Budgets:** autofill under 1000 ms (p75); suggestions popover under 150 ms (p75).

### Folder layout
```
/tests
  /fixtures               # static HTML forms for ATS
    greenhouse-basic.html
    lever-basic.html
    workday-basic.html
    ashby-basic.html
  /utils
    with-extension.ts     # launch Chromium with the unpacked extension
    ai-mocks.ts           # stub window.ai when enabled
  greenhouse.spec.ts
  suggestions.spec.ts
/playwright.config.ts
```

### Launch Chromium with the extension (MV3)
```ts
// tests/utils/with-extension.ts
import { chromium, BrowserContext } from '@playwright/test';
import path from 'path';

export async function launchWithExtension(): Promise<BrowserContext> {
  const extensionPath = path.resolve(__dirname, '../../dist'); // built extension output
  return chromium.launchPersistentContext('', {
    headless: false, // extensions require a headed browser
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}
```

### Playwright config
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  timeout: 30000,
  use: { baseURL: 'http://localhost:4100' },
});
```

### Example: Greenhouse autofill
```ts
// tests/greenhouse.spec.ts
import { test, expect } from '@playwright/test';
import { launchWithExtension } from './utils/with-extension';

let context; let page;

test.beforeAll(async () => {
  context = await launchWithExtension();
  page = await context.newPage();
});

test.afterAll(async () => { await context.close(); });

async function seedProfile() {
  await page.addInitScript(p => {
    // Minimal seed via chrome.storage for demo purposes
    // @ts-ignore
    chrome.storage.local.set({ activeProfile: p });
  }, {
    version: '1',
    basics: { fullName: '<FULL_NAME>', email: '<EMAIL>', phone: '<PHONE>', links: { linkedin: '<LINKEDIN_URL>' } },
  });
}

async function triggerAutofill() {
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('job-autofill:run')));
}

test('fills basics and opens review panel', async () => {
  await seedProfile();
  await page.goto('/fixtures/greenhouse-basic.html');
  await triggerAutofill();

  const name = page.locator('input[name="applicant.name"]');
  const email = page.locator('input[type="email"]');
  const phone = page.locator('input[name*="phone"]');

  await expect(name).not.toHaveValue('');
  await expect(email).not.toHaveValue('');
  await expect(phone).not.toHaveValue('');

  await expect(page.locator('[data-testid="review-drawer"]')).toBeVisible();
});
```

### Example: On‑Focus suggestions
```ts
// tests/suggestions.spec.ts
import { test, expect } from '@playwright/test';
import { launchWithExtension } from './utils/with-extension';

let context; let page;

test.beforeAll(async () => {
  context = await launchWithExtension();
  page = await context.newPage();
});

test.afterAll(async () => { await context.close(); });

test('shows popover and inserts with Enter', async () => {
  await page.goto('/fixtures/lever-basic.html');
  const email = page.locator('input[name="email"]');
  await email.focus();

  const pop = page.locator('[data-testid="suggestions-popover"]');
  await expect(pop).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(email).not.toHaveValue('');
});
```

### Optional: AI‑assisted mapping (mocked)
```ts
// tests/utils/ai-mocks.ts
export function installAIMocks(page) {
  return page.addInitScript(() => {
    // @ts-ignore
    window.ai = {
      createTextSession: async () => ({
        prompt: async () => JSON.stringify({ mapping: { email: 'basics.email' } }),
        destroy: () => {},
      }),
    };
  });
}
```

### CI idea (GitHub Actions)
```yaml
name: e2e
on: [push, pull_request]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build:extension
      - run: npm run install:wizard --dry-run  # Test installation wizard
      - run: npx playwright install --with-deps
      - run: npx http-server tests/fixtures -p 4100 &
      - run: npx playwright test
```

### What to assert
- Values are filled and corresponding DOM events fire (your overlay reacts).
- Drawer/popover are keyboard‑operable and labeled.
- Timing budgets respected in CI (mark slow tests).



---

## 16) Monorepo Setup — Turborepo + pnpm

### Workspace Layout
```
.
├─ apps/
│  ├─ extension/              # MV3 build (background, content, options)
│  └─ fixtures/               # Static server for ATS HTML (Playwright targets)
├─ packages/
│  ├─ lib/                    # Core logic (schema, rules, dom, suggest)
│  └─ ui/                     # Shared React components (shadcn/tailwind)
├─ tooling/
│  ├─ eslint-config/
│  ├─ tailwind-config/
│  └─ install-wizard/        # One-command installation script
├─ turbo.json
├─ pnpm-workspace.yaml
├─ package.json               # root scripts (turbo entrypoint)
└─ README.md
```

### pnpm workspaces
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### Turborepo pipeline
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": { "outputs": [] },
    "typecheck": { "outputs": [] },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "e2e": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

### Root package.json (scripts)
```json
{
  "name": "job-autofill-monorepo",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "install:wizard": "bash tooling/install-wizard/install.sh",
    "build": "turbo run build",
    "dev": "turbo run dev --parallel --filter=apps/extension",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "e2e": "turbo run e2e --filter=apps/extension"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### apps/extension package
```json
// apps/extension/package.json
{
  "name": "extension",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "e2e": "playwright test"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.268",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^9",
    "@playwright/test": "^1.47"
  }
}
```

**Vite entries (suggested):**
```
apps/extension/
  src/
    background.ts
    content.ts
    options/main.tsx
    overlay/main.tsx
  manifest.json        # MV3
  vite.config.ts       # multiple entry points, outDir: dist
```

### apps/fixtures package
```json
// apps/fixtures/package.json
{
  "name": "fixtures",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "http-server . -p 4100 -c-1",
    "build": "echo 'no build'",
    "lint": "eslint . || true",
    "typecheck": "tsc -v >/dev/null || true"
  },
  "devDependencies": {
    "http-server": "^14"
  }
}
```
```
apps/fixtures/
  fixtures/
    greenhouse-basic.html
    lever-basic.html
    workday-basic.html
    ashby-basic.html
```

### packages/lib package
```json
// packages/lib/package.json
{
  "name": "lib",
  "private": true,
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --dts --format=esm,cjs",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.build.json",
    "test": "vitest run"
  },
  "devDependencies": {
    "tsup": "^8",
    "vitest": "^2"
  }
}
```
```
packages/lib/src/
  profile.schema.ts
  rules.engine.ts
  dom.scan.ts
  fill.run.ts
  suggest.ts
  index.ts
```

### packages/ui package
```json
// packages/ui/package.json
{
  "name": "ui",
  "private": true,
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --dts --format=esm",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.build.json",
    "test": "vitest run"
  }
}
```
```
packages/ui/src/
  components/
    ReviewDrawer.tsx
    SuggestionsPopover.tsx
    CopyPromptButton.tsx
  index.ts
```

### tooling (shared configs)
```
tooling/eslint-config/index.js
module.exports = { extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'] };

tooling/tailwind-config/tailwind.config.js
module.exports = { content: ['../../apps/**/*.{ts,tsx,html}', '../../packages/ui/src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] };
```

### Wiring it up
- The extension app imports from `packages/lib` and `packages/ui`.
- Turbo caches each package build; `apps/extension` rebuilds only if deps changed.
- E2E task depends on `apps/fixtures` running (CI starts a local server).

### Useful Turbo filters
```
# Run tests only for changed packages
pnpm turbo run test --filter=...[HEAD^]

# Build extension and its deps only
pnpm turbo run build --filter=apps/extension...
```

### CI outline
- Install deps → `pnpm build` → start fixtures server → `pnpm e2e`.
- Cache Turbo and Playwright browsers between runs for speed.

