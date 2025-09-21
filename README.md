# Local-First Job Autofill Extension

[![Privacy First](https://img.shields.io/badge/Privacy%20First-100%25%20Local-blue.svg)](https://github.com/yourusername/local-fill)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-MV3-green.svg)](https://developer.chrome.com/docs/extensions/mv3)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

A privacy-first browser extension that autofills job application forms using your local profile data. **Zero server calls, zero tracking** - everything happens in your browser.

## 🎯 Why Local-First?

In this era of AI and software, **Personally Identifiable Information (PII) is more important than ever**. Traditional job autofill tools send your data to remote servers, creating unnecessary privacy risks and potential data breaches.

**Local-First** means:
- ✅ Your profile data never leaves your device
- ✅ No server calls, no tracking, no data collection
- ✅ Works offline and respects your privacy
- ✅ Easy setup with just a JSON file

## ✨ Features

### Core Functionality
- **One-Click Autofill** - Fill entire job forms with a single click or hotkey
- **Local Profile Storage** - Store multiple profiles in IndexedDB (encrypted optional)
- **ATS Support** - Works with Greenhouse, Lever, Workday, Ashby, and more
- **Smart Field Detection** - Automatically detects and maps form fields

### Privacy-First Features
- **Copy LLM Prompt** - Generate profile JSON using any AI tool without sharing data
- **On-Focus Suggestions** - Get contextual suggestions as you fill forms
- **Review Panel** - Preview changes before applying, with undo capability
- **Domain Rules** - Per-site customization with user overrides

### Developer Experience
- **TypeScript** - Full type safety throughout
- **Modern React UI** - Built with React 18 and Tailwind CSS
- **shadcn/ui Components** - Beautiful, accessible UI components
- **Comprehensive Testing** - Unit tests, E2E tests, and Playwright automation

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/local-fill.git
   cd local-fill
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the extension**
   ```bash
   pnpm build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the `apps/extension/dist` folder

### Creating Your Profile

1. **Open the extension options page**
2. **Click "Copy LLM Prompt"** to get a template
3. **Paste into your preferred AI tool** and generate your profile JSON
4. **Import the JSON** into the extension

**Example Profile Structure:**
```json
{
  "version": "1",
  "basics": {
    "fullName": "Your Name",
    "email": "your.email@example.com",
    "phone": "+1-555-0123",
    "location": {
      "city": "Your City",
      "region": "Your State",
      "country": "Your Country"
    },
    "links": {
      "linkedin": "https://linkedin.com/in/yourprofile",
      "github": "https://github.com/yourusername"
    }
  },
  "work": [
    {
      "company": "Your Company",
      "title": "Your Title",
      "start": "2020-01",
      "end": null,
      "location": "City, Country",
      "summary": "Brief description of your role",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Name",
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
```

## 📖 Usage

### Autofilling Forms
1. Navigate to a job application form on supported ATS platforms
2. Click the extension icon or press `Alt+A` (customizable)
3. Review the preview panel and click "Apply" to fill

### Managing Profiles
- **Options Page** - Import/export profiles, create multiple profiles
- **Profile Switcher** - Quickly switch between different profiles
- **Rules Editor** - Customize field mappings per domain

### On-Focus Suggestions
- Focus any form field to see contextual suggestions
- Use arrow keys to navigate, Enter to select
- "More..." option opens snippet library for custom text

## 🔧 Development

### Project Structure
```
local-fill/
├── apps/
│   ├── extension/          # Main Chrome extension
│   └── fixtures/           # Test HTML fixtures
├── packages/
│   ├── lib/                # Core business logic
│   └── ui/                 # Shared UI components
├── tooling/                # ESLint, Tailwind configs
└── docs/                   # Documentation
```

### Available Scripts
```bash
# Development
pnpm dev                    # Start extension in dev mode
pnpm build                  # Build for production
pnpm lint                   # Run linting
pnpm typecheck              # Type checking
pnpm test                   # Run unit tests
pnpm e2e                    # Run E2E tests

# Testing
pnpm test:fixtures          # Start test server
pnpm test:e2e:ui            # Run E2E with UI
```

### Key Technologies
- **MV3 (Manifest V3)** - Modern Chrome extension architecture
- **React 18** - UI framework with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **IndexedDB** - Local data storage
- **Playwright** - E2E testing framework

## 🔒 Privacy & Security

### Privacy-First Design
- **Local Storage Only** - All data stored in IndexedDB
- **No Network Calls** - Extension never phones home
- **Zero Tracking** - No analytics, no data collection
- **PII Protection** - Profile templates use placeholders in docs

### Security Features
- **Domain Allowlist** - Control which sites the extension works on
- **Panic Wipe** - Clear all data instantly
- **Audit Log** - Track what was filled and when (local only)
- **Safe Prompts** - LLM templates are PII-free

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Testing Requirements
- Unit tests for new features
- E2E tests for UI changes
- Accessibility testing for user-facing features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Local-Fill Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Built with modern web technologies for privacy and performance
- Inspired by the need for privacy-first job application tools
- Thanks to the open-source community for amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/local-fill/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/local-fill/discussions)
- **Documentation**: See the `/docs` folder for detailed guides

---

**Privacy First. Local Only. Your Data Stays Yours.** 🎯
