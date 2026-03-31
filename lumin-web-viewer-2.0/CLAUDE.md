# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumin Web Viewer 2.0 is a React-based PDF viewer and editor built on top of PDFTron WebViewer. It's a large-scale enterprise application with 70+ feature modules, 50+ screens, and comprehensive document management capabilities including annotations, collaboration, digital signatures, OCR, and AI assistance.

## Common Commands

### Development
```bash
pnpm install                    # Install dependencies
pnpm start                      # Start development server (port 3000)
pnpm run start:rspack          # Start with Rspack bundler (faster)
git submodule update --init --recursive  # Initialize submodules (PDFTron core)
pnpm run download-webviewer    # Download PDFTron Core v8.6.1
```

### Testing
```bash
pnpm run test-jest              # Run unit tests (Jest)
pnpm run test-jest:coverage     # Run tests with coverage report
pnpm run test-jest:silent       # Run tests in silent mode
pnpm run cypress:open           # Open Cypress for E2E testing
```

### Linting and Code Quality
```bash
pnpm run lint                   # Lint JavaScript/TypeScript files
pnpm run lint:electron          # Lint Electron files
pnpm run lint:all               # Lint all files
pnpm run lint:fix               # Auto-fix linting issues
pnpm run lint:fix:all           # Auto-fix all linting issues
```

### Building
```bash
pnpm run build                  # Production build
pnpm run build:analyze          # Build with bundle analysis
pnpm run clean                  # Clean build artifacts
```

### Electron (Desktop App)
```bash
pnpm run electron:dev           # Run Electron in development
pnpm run electron:dist          # Build Electron distributables
pnpm run electron:dist:mac      # Build for macOS
pnpm run electron:dist:win      # Build for Windows
pnpm run electron:dist:linux    # Build for Linux
```

## Architecture Overview

### State Management
- **Redux**: Primary state management using Redux Thunk middleware
  - Actions: `src/redux/actions/`
  - Reducers: `src/redux/reducers/`
  - Selectors: `src/redux/selectors/`
  - Store: `src/redux/store/index.ts`
  - Redux Logger enabled in development mode
  - Hot module replacement for reducers in development

- **Apollo Client**: GraphQL state management
  - Setup: `src/apollo/index.js`
  - Queries/Mutations: `src/graphql/`
  - Uses HTTP link for queries/mutations and WebSocket link for subscriptions
  - InMemoryCache with custom error handling

### Module Path Aliases
The project uses extensive path aliases (tsconfig.json). Always use these instead of relative imports:
```typescript
import { action } from 'actions/someAction';           // Redux actions
import { selector } from 'selectors/someSelector';     // Redux selectors
import Component from 'luminComponents/Component';     // Lumin components
import { helper } from 'helpers/someHelper';           // Helper functions
import { utility } from 'utils/someUtil';              // Utility functions
import Service from 'services/someService';            // API services
import { CONSTANT } from 'constants/someConstant';     // Constants
import Feature from 'features/FeatureName';            // Feature modules
import Hook from 'hooks/useHook';                      // Custom hooks
```

### Feature-Based Architecture
Features are self-contained modules in `src/features/` (70+ features):
- Each feature typically contains components, hooks, utilities, and services
- Key features: `Document/`, `Annotation/`, `Collaboration/`, `Signature/`, `AIChatBot/`, `DocumentOCR/`, `Redact/`, `Comments/`

### Screen-Based Routing
Screens in `src/screens/` represent top-level routes (50+ screens):
- `Viewer/` - Main PDF viewer screen
- `Home/` - Dashboard/home screen
- `PersonalDashboard/` - User dashboard
- `OrganizationDashboard/` - Organization management
- `Settings/` - Application settings
- `Payment/` - Payment processing
- `AuthenContainer/` - Authentication pages

### Service Layer
`src/services/` contains API integration modules:
- `documentServices.js` - Document operations
- `authServices.js` - Authentication
- `organizationServices.js` - Organization management
- `socketServices.js` - WebSocket communication
- `graphServices/` - GraphQL services
- Integration services: `googleServices.js`, `oneDriveServices/`, `paymentService.js`

### PDFTron Core Integration
- Core library: Submodule at `lib/` or downloaded via npm script
- Core APIs: `src/core/` - Wrapper APIs for PDFTron functionality
- Event Listeners: `src/event-listeners/` - Handlers for PDFTron Core events
- Critical PDFTron hooks to watch: `annotationChanged`, `annotationAdded`, `fieldChanged`, `annotationDoubleClicked`, `pageComplete`, `documentLoaded`, `annotationsLoaded`, `documentReady`, `locationSelected`

### Styling
- **SCSS Modules**: Use `*.module.scss` files (not traditional CSS/SCSS)
- Component styles imported as modules: `import styles from './Component.module.scss'`

### Custom UI Library
- Internal: `lumin-components/` - Lumin-specific components (400+ components)
- External: `lumin-ui` - Shared design system package from BitBucket
- Aliases: `@new-ui/` for GeneralLayout, `@web-new-ui/` for ReskinLayout

## Development Guidelines

### Code Style (from .cursor/rules and .eslintrc.js)
- Prioritize functional components with hooks over class components
- Use TypeScript when possible, especially for new files
- Avoid unnecessary comments - code should be self-explanatory
- Strictly follow ESLint/Prettier rules
- Max line length: 120 characters
- Use single quotes, semicolons required
- Import order is enforced (external → internal → styles)

### Import Restrictions
- **Icon imports**: Use `@luminpdf/icons/dist/csr/IconName` (not barrel export)
- **Idle callbacks**: Use `helpers/requestIdleCallback` utility (not global)

### Performance
- Use `React.memo`, `useMemo`, `useCallback` judiciously (avoid over-optimization)
- Lazy load screens with `React.lazy()` and `Suspense`
- Keep components small and focused (single responsibility)

### Testing
- Jest for unit tests with React Testing Library
- Test files: `*.spec.js` or `*.spec.ts`
- Coverage paths excluded: apollo, core, constants, event-listeners, graphql, redux, HOC, socket
- Always run tests before committing

### Git Workflow
- Main development branch: `develop`
- Staging branch: `master` (deployed to staging)
- Production branch: `production`
- Use Gitmoji for commit messages (see README badge)
- Pre-commit hooks via Husky enforce linting
- Commitlint enforces conventional commits

## Environments

- **Local**: Development on local machine
- **PNB**: `pnb` branch → https://pnb.luminpdf.com
- **OneDrive Dev**: `onedrive-dev` branch → https://onedrive-dev.luminpdf.com
- **CNC**: `cnc` branch → https://cnc.luminpdf.com
- **Mobile Staging**: `mobile-staging` branch → https://mobile-staging.luminpdf.com
- **Viewer**: `viewer` branch → https://viewer.luminpdf.com
- **Viewer Staging**: `viewer-staging` branch → https://viewer-staging.luminpdf.com
- **Viewer Testing**: `viewer-testing` branch → https://viewer-testing.luminpdf.com
- **Development**: `develop` branch → https://app-dev.luminpdf.com
- **Staging**: `master` branch → https://app-staging.luminpdf.com
- **Pre-production**: `production` branch → https://app-testing.luminpdf.com (restricted access)
- **Production**: `production` branch → https://app.luminpdf.com

Environment variables: Add to `settings/development.json` and notify lead developer for other environments.

## Special Procedures

### Updating PDFTron Version
See `PDFTronUpgrade.md` for detailed steps:
1. Read PDFTron changelog between current and target versions
2. Cherry-pick relevant changes from PDFTron WebViewer UI repo
3. Update Core SDK via nightly builds or `download-webviewer` script
4. Push Core changes to `lumin-web-core` submodule repo
5. Test critical hooks and core functionality thoroughly

### Adding to Submodule
```bash
git submodule update --remote  # Update to latest lumin-web-core
```

### Docker
```bash
make start environment=<branch_name>  # Start with Docker
docker build -t nitrolabs/lumin-web-viewer .
docker run --rm -p 3000:80 nitrolabs/lumin-web-viewer
```

## CI/CD
- CircleCI for continuous integration (see badge in README)
- Bitbucket Pipelines configuration: `bitbucket-pipelines.yml`
- Pipeline steps: lint, test with coverage, secret scanning, SonarCloud scanning
- Test coverage badges auto-generated and uploaded to Bitbucket

## Key Technologies
- React 18.2.0 with functional components and hooks
- TypeScript + JavaScript (mixed codebase, migrating to TS)
- Redux + Redux Thunk for state management
- Apollo Client for GraphQL (queries, mutations, subscriptions via WebSocket)
- PDFTron WebViewer 8.6.1 for PDF functionality
- Material-UI v5 + Mantine v8 for UI components
- Emotion + Styled Components for styling
- Webpack 5 / Rspack for bundling
- Socket.io for real-time collaboration
- Electron for desktop application

## Common Pitfalls
- Don't modify `src/core/` directly - it's PDFTron API wrappers
- Prefer using path aliases, not relative imports
- Use SCSS modules (`*.module.scss`), not traditional CSS/SCSS files
- Don't commit directly to `production` branch
- Keep PDFTron Core version in sync with UI changes
- Run linting before committing to avoid CI failures
