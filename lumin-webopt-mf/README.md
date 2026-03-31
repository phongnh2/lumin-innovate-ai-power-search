# Lumin WebOpt MF

A microfrontend for Lumin PDF web optimization features built with React 18, TypeScript, and Rsbuild.

## Prerequisites

- Node.js 22.15.0
- pnpm 8.6.1

Use [mise](https://mise.jdx.dev/) to manage tool versions automatically:

```bash
mise install
```

## Setup

Install dependencies:

```bash
just re-install
# or
npx pnpm@8.6.1 install
```

## Development

Start the development server at [http://localhost:3600](http://localhost:3600):

```bash
just dev
# or
LUMIN_ENVIRONMENT_NAME=local npx pnpm@8.6.1 dev
```

## Environment Configuration

Copy the example environment file and adjust as needed:

```bash
cp env.example .env
```

The project uses settings from `settings/local.json` for local development.

## Build

Build for production:

```bash
npx pnpm@8.6.1 build
```

Preview production build:

```bash
npx pnpm@8.6.1 preview
```

## Project Structure

```
lumin-webopt-mf/
├── src/
│   ├── components/      # Shared components
│   ├── configs/         # Environment & app configs
│   ├── constants/       # App constants
│   ├── HOC/             # Higher Order Components
│   ├── hooks/           # Custom React hooks
│   ├── libs/            # Third-party library wrappers
│   ├── modules/         # Feature modules
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── settings/            # Environment-specific configs
├── scripts/             # Build & deployment scripts
└── justfile             # Just command recipes
```

## Module Federation

This microfrontend is part of the Lumin PDF ecosystem and exposes components via Module Federation.

## Learn More

- [Rsbuild Documentation](https://rsbuild.rs)
- [Module Federation](https://module-federation.io/)
