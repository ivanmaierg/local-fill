# Development Task List - Local-First Job Autofill Extension

This task list breaks down the development of the job application autofill extension into manageable, prioritized tasks following the milestones outlined in the project documentation.

## 📋 Overview

This is a Chrome MV3 extension that provides:
- **Local-first** job application autofilling from user-provided JSON profiles
- **Privacy-focused** design with no outbound network calls
- **Multi-ATS support** (Greenhouse, Lever, Workday, Ashby)
- **Advanced features** like on-focus suggestions and LLM prompt copying
- **Comprehensive testing** with Playwright E2E tests

## 🎯 Milestones (M0-M6)

### M0 - Project Scaffold & Infrastructure
- [x] Set up Turborepo monorepo structure with pnpm workspaces
- [x] Configure MV3 manifest with proper permissions and content scripts
- [x] Set up Vite build configuration with multiple entry points
- [x] Create IndexedDB wrapper and chrome.storage utilities
- [x] Initialize shadcn/ui components library with TailwindCSS

### M1 - Profile Management System
- [x] Implement Profile JSON schema validation (Zod, schema v1)
- [x] Create Profile import/export functionality with error handling
- [x] Build multi-profile storage and active profile management
- [x] Add profile validation and sanitization

### M2 - Core Autofill Engine
- [ ] Build DOM scanner to extract field candidates from ATS pages
- [ ] Create field mapping engine with confidence scoring
- [ ] Implement autofill execution with proper event dispatching
- [ ] Build Review Panel UI with mapped/unmapped field display
- [ ] Add inline editing and undo functionality

### M3 - ATS Rules & Customization
- [ ] Create seed rules pack for Greenhouse (`boards.greenhouse.io`)
- [ ] Create seed rules pack for Lever (`jobs.lever.co`)
- [ ] Create seed rules pack for Workday (`*.myworkdayjobs.com`)
- [ ] Create seed rules pack for Ashby (`*.ashbyhq.com`)
- [ ] Implement user override rules system with persistence

### M4 - On-Focus Suggestions & UX
- [ ] Build suggestion engine with ranking algorithm
- [ ] Create suggestion popover UI with keyboard navigation
- [ ] Implement snippet library for cover letters and answers
- [ ] Add accessibility features (ARIA, focus management)
- [ ] Integrate with Chrome AI APIs (feature-gated, optional)

### M5 - Copy LLM Prompt Feature
- [x] Implement Copy LLM Prompt button with clipboard API
- [x] Create PII-free prompt template for profile generation
- [x] Add success/error toast notifications

### M6 - Polish & Production Readiness
- [ ] Add performance optimizations (debouncing, timing budgets)
- [ ] Implement shadow DOM and iframe handling
- [ ] Add comprehensive metrics collection (local, opt-in)
- [ ] Complete accessibility audit and fixes
- [ ] Final integration testing and bug fixes

## 🧪 Testing & Quality Assurance

### Test Infrastructure Setup
- [x] Create HTML fixtures for ATS platforms testing
- [ ] Set up Playwright E2E testing with extension support
- [ ] Implement unit tests for core modules
- [ ] Add performance timing budget tests

### Testing Tasks
- [ ] Unit tests: schema validation, rules engine, transformers
- [ ] Integration tests: autofill flows, DOM handling
- [ ] E2E tests: full user workflows across ATS platforms
- [ ] Accessibility tests: keyboard navigation, screen readers
- [ ] Performance tests: timing budgets, memory usage

## 🏗️ Architecture Components

### Core Modules (`packages/lib/`)
- [x] `profile.schema.ts` - Zod validation schemas
- [ ] `rules.engine.ts` - Field mapping and rule resolution
- [ ] `dom.scan.ts` - DOM analysis and candidate extraction
- [ ] `fill.run.ts` - Autofill execution and event dispatching
- [ ] `suggest.ts` - Suggestion ranking and snippet generation
- [x] `storage.ts` - IndexedDB and chrome.storage wrappers

### UI Components (`packages/ui/`)
- [ ] `ReviewDrawer.tsx` - Review panel with editing capabilities
- [ ] `SuggestionsPopover.tsx` - On-focus suggestion UI
- [x] `CopyPromptButton.tsx` - LLM prompt copying functionality
- [x] `ProfileManager.tsx` - Profile switching and management
- [ ] `RulesEditor.tsx` - User rules customization interface

### Extension Pages (`apps/extension/`)
- [x] `background.ts` - Service worker for rule engine and messaging
- [x] `content.ts` - Content script for DOM interaction and UI
- [x] `options/main.tsx` - React options page for settings
- [x] `overlay/main.tsx` - Overlay UI components

## 🔧 Development Environment

### Build & Development Tools
- [x] Configure TypeScript with strict settings
- [x] Set up ESLint and Prettier for code quality
- [x] Configure TailwindCSS with design tokens
- [x] Set up development server with hot reloading
- [x] Add build optimization and source maps

### CI/CD Pipeline
- [ ] GitHub Actions workflow for automated testing
- [ ] Build verification and linting
- [ ] Playwright browser testing in CI
- [ ] Extension packaging and validation

## 📊 Success Metrics (Implementation)

### Performance Targets
- [ ] Autofill execution < 1s (p75 percentile)
- [ ] Suggestion popover display < 150ms (p75 percentile)
- [ ] ≥90% success rate on seed ATS platforms

### Quality Gates
- [ ] All unit tests passing (>80% coverage)
- [ ] All E2E tests passing
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance budgets met
- [ ] No console errors in production builds

## 🚀 Getting Started

1. **Start with M0** - Get the basic scaffold working
2. **Focus on M1** - Profile management is foundational
3. **Build M2** - Core autofill is the main feature
4. **Test incrementally** - Use fixtures for each ATS platform
5. **Polish at the end** - M6 brings everything together

## 📝 Notes

- **Privacy-first**: Ensure no network calls except when explicitly enabled
- **Local storage**: All user data stays in IndexedDB/chrome.storage
- **ATS compatibility**: Start with Greenhouse/Lever, expand to Workday/Ashby
- **Testing**: Use real ATS page structures in fixtures for accurate testing
- **Accessibility**: Implement keyboard navigation and ARIA labels throughout

This task list provides a comprehensive roadmap for building the job autofill extension. Each task is designed to be independently testable and deliverable.
