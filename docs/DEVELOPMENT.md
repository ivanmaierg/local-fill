# Local-Fill Development Guide

## Project Structure

This is a Turborepo monorepo containing the Local-Fill job application autofill extension.

```
local-fill/
├── apps/
│   ├── extension/          # Main Chrome MV3 extension
│   │   ├── src/
│   │   │   ├── background.ts    # Service worker
│   │   │   ├── content.ts       # Content script
│   │   │   ├── options/         # React options page
│   │   │   ├── overlay/         # Overlay UI components
│   │   │   └── styles/          # Tailwind CSS
│   │   ├── manifest.json        # MV3 manifest
│   │   └── vite.config.ts       # Vite build config
│   └── fixtures/           # Test HTML fixtures
│       └── fixtures/       # ATS platform test pages
├── packages/
│   ├── lib/                # Core business logic
│   │   ├── src/
│   │   │   ├── profile.schema.ts  # Zod validation schemas
│   │   │   └── storage.ts         # IndexedDB & chrome.storage
│   │   └── package.json
│   └── ui/                 # Shared React components
│       ├── src/
│       │   └── components/ # Reusable UI components
│       └── package.json
├── tooling/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── tailwind-config/    # Shared Tailwind configuration
│   └── install-wizard/     # One-command installation script
├── turbo.json              # Turborepo pipeline configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+
- Chrome or Chromium browser

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build the extension:**
   ```bash
   pnpm build
   ```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select `apps/extension/dist`

### Development

1. **Start development server:**
   ```bash
   pnpm dev
   ```

2. **Run tests:**
   ```bash
   pnpm test
   ```

3. **Run E2E tests:**
   ```bash
   pnpm e2e
   ```

4. **Start fixtures server:**
   ```bash
   pnpm test:fixtures
   ```

## Architecture

### Extension Structure

- **Background Script** (`background.ts`): Service worker handling rule resolution and messaging
- **Content Script** (`content.ts`): DOM scanning and autofill execution
- **Options Page** (`options/`): React app for profile and settings management
- **Overlay UI** (`overlay/`): React components for suggestions and review panel

### Core Libraries

- **lib package**: Business logic, schemas, and storage utilities
- **ui package**: Reusable React components with Tailwind CSS

### Build System

- **Vite**: Fast build tool with multiple entry points
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Turborepo**: Monorepo build orchestration

## Development Workflow

1. **Make changes** to source files
2. **Build** with `pnpm build`
3. **Reload** extension in Chrome
4. **Test** on fixture pages or real ATS platforms
5. **Run tests** to ensure everything works

## Testing

### Unit Tests
- Located in each package's `src/` directory
- Run with `pnpm test`

### E2E Tests
- Use Playwright to test the full extension
- Test against HTML fixtures in `apps/fixtures/`
- Run with `pnpm e2e`

### Manual Testing
- Use the fixtures server: `pnpm test:fixtures`
- Navigate to `http://localhost:4100/fixtures/`
- Test on real ATS platforms (Greenhouse, Lever, etc.)

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Submit** a pull request

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check Chrome console for errors
2. **Build failures**: Ensure all dependencies are installed
3. **Type errors**: Run `pnpm typecheck` to identify issues
4. **Styling issues**: Check Tailwind CSS configuration

### Debug Mode

- Set `minify: false` in Vite config for readable builds
- Use Chrome DevTools to debug content scripts
- Check background script logs in `chrome://extensions/`

## License

MIT License - see [LICENSE](LICENSE) for details.
