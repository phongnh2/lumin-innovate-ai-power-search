# 📦 Electron Build Guide - Multi-Environment Setup

This guide explains how to build the Lumin PDF Electron app for different environments.

## ✅ What Was Implemented

### 1. **Build Script** (`scripts/generate-electron-config.js`)
- Generates `electron-config.json` with branch configuration
- Only runs in production mode (skipped in development)
- Accepts `--branch` flag or `LUMIN_BRANCH` environment variable

### 2. **Environment Service** (`electron/services/EnvironmentService.js`)
- Reads bundled config file in production
- Uses localhost in development (no config needed)
- Loads branch-specific settings from `settings/<namespace>/<branch>.json`

### 3. **Updated Scripts** (`package.json`)
- All `electron:dist:*` commands now generate config before building
- Development commands work without config generation

### 4. **Git Configuration**
- Added `electron/electron-config.json` to `.gitignore`
- Created `electron-config.example.json` for reference

## 🚀 Usage

### Development (No Config Needed)

```bash
# Start dev environment with hot reload
pnpm run electron:dev

# Or with Rspack
pnpm run electron:dev:rspack
```

**What happens:**
- ✅ No config file generated
- ✅ Uses localhost:3000
- ✅ Fast development workflow

### Production Builds

#### Option 1: Default Build (develop branch)
```bash
pnpm run electron:dist
```

#### Option 2: Specify Branch via Flag
```bash
pnpm run generate-electron-config -- --branch=production
pnpm run electron:dist:mac
```

#### Option 3: Specify Branch via Environment Variable
```bash
LUMIN_BRANCH=staging pnpm run electron:dist:win
```

#### Option 4: Combined
```bash
NODE_ENV=production LUMIN_BRANCH=production pnpm run electron:dist:linux
```

## 🌍 Available Environments

### Develop Namespace
| Branch | URL |
|--------|-----|
| `develop` | https://app-dev.luminpdf.com |
| `viewer` | https://viewer.luminpdf.com |
| `pnb` | https://pnb.luminpdf.com |
| `onedrive-dev` | https://onedrive-dev.luminpdf.com |

### Staging Namespace
| Branch | URL |
|--------|-----|
| `staging` | https://app-staging.luminpdf.com |
| `viewer-staging` | https://viewer-staging.luminpdf.com |
| `mobile-staging` | https://mobile-staging.luminpdf.com |
| `cnc` | https://cnc.luminpdf.com |
| `viewer-testing` | https://viewer-testing.luminpdf.com |

### Production Namespace
| Branch | URL |
|--------|-----|
| `production` | https://app.luminpdf.com |
| `preprod` | https://app-testing.luminpdf.com |

## 📋 Step-by-Step Examples

### Building for Production (macOS)

```bash
# 1. Generate config for production branch
pnpm run generate-electron-config -- --branch=production

# 2. Build macOS app
pnpm run electron:dist:mac

# 3. Find your app in dist/mac/
```

### Building for Staging (Windows)

```bash
# 1. Set branch
LUMIN_BRANCH=staging

# 2. Build (config generated automatically)
pnpm run electron:dist:win

# 3. Find your app in dist/win-unpacked/
```

### Building for Testing (MacOS only)

```bash
# Test build without publishing
LUMIN_BRANCH=[branch-name] pnpm run electron:dist:test
```

## 🔍 How It Works

### Build Time Flow

```
1. pnpm run electron:dist
   ↓
2. NODE_ENV=production
   ↓
3. generate-electron-config.js runs
   ↓
4. Reads --branch flag or LUMIN_BRANCH env var
   ↓
5. Creates electron/electron-config.json:
   {
     "branch": "production",
     "generatedAt": "2025-10-02T12:00:00.000Z"
   }
   ↓
6. electron-builder packages the app
   ↓
7. Config file bundled into app
```

### Runtime Flow

```
1. Electron app starts
   ↓
2. EnvironmentService initializes
   ↓
3. Development mode?
   ├─ YES → Use localhost:3000
   └─ NO → Read electron-config.json
             ↓
             Get branch name
             ↓
             Load settings/<namespace>/<branch>.json
             ↓
             Extract:
             - LUMIN_BASEURL
             - LUMIN_GOOGLE_PICKER_CLIENTID
             - LUMIN_AUTH_SERVICE_URL
             ↓
             Connect to backend
```

## 🎯 CI/CD Integration

### Bitbucket Pipelines Example (pnpm)

```yaml
pipelines:
  branches:
    production:
      - step:
          name: Build Production Electron App
          script:
            - export LUMIN_BRANCH=production
            - corepack enable
            - pnpm install --frozen-lockfile
            - pnpm run electron:dist:mac
            - pnpm run electron:dist:win
    
    staging:
      - step:
          name: Build Staging Electron App
          script:
            - corepack enable
            - pnpm run generate-electron-config -- --branch=staging
            - pnpm run electron:dist
```

### GitHub Actions Example (pnpm)

```yaml
- name: Build Electron App
  run: |
    pnpm run generate-electron-config -- --branch=${{ env.BRANCH_NAME }}
    pnpm run electron:dist:${{ matrix.platform }}
  env:
    NODE_ENV: production
```

## 🛠️ Troubleshooting

### Error: "electron-config.json not found"

**Cause:** Building in production without generating config

**Solution:**
```bash
pnpm run generate-electron-config -- --branch=<branch-name>
```

### Wrong Backend URL

**Cause:** Built with wrong branch

**Solution:** Check which branch was used:
```bash
cat electron/electron-config.json
```
Rebuild with correct branch.

### Development Mode Not Working

**Cause:** Config file exists from previous production build

**Solution:** Config file is ignored in development mode. No action needed.

## 📁 File Structure

```
project/
├── electron/
│   ├── services/
│   │   └── EnvironmentService.js     # Loads environment config
│   ├── electron-config.json           # Generated, gitignored
│   └── electron-config.example.json   # Example for reference
├── scripts/
│   └── generate-electron-config.js    # Generates config file
├── settings/
│   ├── develop/
│   │   ├── _common.json
│   │   ├── develop.json
│   │   └── viewer.json
│   ├── staging/
│   │   └── ...
│   └── production/
│       └── ...
└── package.json                       # Build scripts
```

## 🎓 Best Practices

1. **Always specify branch for production builds**
   ```bash
   pnpm run generate-electron-config -- --branch=production
   ```

2. **Test builds before releasing**
   ```bash
   pnpm run electron:dist:test
   ```

3. **Use environment variables in CI/CD**
   ```bash
   LUMIN_BRANCH=production pnpm run electron:dist
   ```

4. **Keep electron-config.json in .gitignore**
   - Already configured ✅

5. **Document which branch each release uses**
   - Include in release notes

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `electron/README.md`
3. Check branch configuration in `settings/`
4. Contact the development team

---

**Last Updated:** October 2, 2025
**Version:** 1.0.0

