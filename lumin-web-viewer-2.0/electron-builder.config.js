const branch = process.env.LUMIN_BRANCH;

if (!branch) {
  throw new Error('LUMIN_BRANCH environment variable is required');
}

const productionName = 'Lumin for Desktop';
const productionAppId = 'com.lumin.pdf';

const branchConfig = {
  production: {
    productName: productionName,
    appId: productionAppId,
  },
  preprod: {
    productName: `${productionName} (Pre-Production)`,
    appId: `${productionAppId}.preprod`,
  },
  staging: {
    productName: `${productionName} (Staging)`,
    appId: `${productionAppId}.staging`,
  },
  'viewer-staging': {
    productName: `${productionName} (Viewer Staging)`,
    appId: `${productionAppId}.viewer-staging`,
  },
  'viewer-testing': {
    productName: `${productionName} (Viewer Testing)`,
    appId: `${productionAppId}.viewer-testing`,
  },
  viewer: {
    productName: `${productionName} (Viewer)`,
    appId: `${productionAppId}.viewer`,
  },
  develop: {
    productName: `${productionName} (Development)`,
    appId: `${productionAppId}.dev`,
  },
  cnc: {
    productName: `${productionName} (CNC)`,
    appId: `${productionAppId}.cnc`,
  },
  'mobile-staging': {
    productName: `${productionName} (Mobile Staging)`,
    appId: `${productionAppId}.mobile-staging`,
  },
  pnb: {
    productName: `${productionName} (PNB)`,
    appId: `${productionAppId}.pnb`,
  },
  'onedrive-dev': {
    productName: `${productionName} (OneDrive Dev)`,
    appId: `${productionAppId}.onedrive-dev`,
  },
};

if (!branchConfig[branch]) {
  throw new Error(`No branch config found for ${branch}. Please check the LUMIN_BRANCH environment variable.`);
}

const config = branchConfig[branch];

console.info(`🔧 Building Electron app for branch: ${branch}`);
console.info(`📦 Product Name: ${config.productName}`);
console.info(`🆔 App ID: ${config.appId}`);

module.exports = {
  appId: config.appId,
  productName: config.productName,
  directories: {
    output: 'dist',
  },
  asar: branch === 'production',
  compression: 'store',
  removePackageScripts: true,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  npmRebuild: false,
  files: [
    'electron/**/*',
    '!electron/**/*.ts',
    '!electron/tsconfig.json',
    'settings/**/*',
    'assets/favicon/**/*',
    '!node_modules/**/*',
    'node_modules/electron-updater/**/*',
    'node_modules/electron/**/*',
    'node_modules/mime-types/**/*',
    'package.json',
    '!build/**/*',
    '!src/**/*',
    '!lib/**/*',
    '!assets/**/*',
    '!**/test/**/*',
    '!**/*.test.*',
    '!**/*.spec.*',
    '!**/cpu-features/**/*',
    '!**/*.map',
    '!**/docs/**/*',
    '!**/examples/**/*',
    '!**/.git/**/*',
    '!**/.github/**/*',
    '!**/README.md',
    '!**/CHANGELOG.md',
    '!**/LICENSE',
    '!**/*.md',
    '!webpack.config.*',
    '!babel.config.js',
    '!jest.config.json',
    '!tsconfig.json',
    '!.eslintrc.*',
    '!.prettierrc.*',
    '!public/**/*',
    '!i18n/**/*',
    '!font-icomoon/**/*',
    '!scripts/**/*',
    '!dev-server.js',
    '!setupTests.js',
    '!bitbucket-pipelines.yml',
    '!Dockerfile',
    '!Makefile',
    '!sonar-project.properties',
  ],
  fileAssociations: [
    {
      ext: 'pdf',
      name: 'PDF Document',
      description: 'PDF file',
      role: 'Viewer',
      icon: 'assets/favicon/favicon-desktop-app.png',
    },
  ],
  mac: {
    icon: 'assets/favicon/favicon-desktop-app.png',
    category: 'public.app-category.productivity',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    type: 'distribution',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
    ],
  },
  win: {
    icon: 'assets/favicon/favicon-desktop-app.png',
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32'],
      },
      {
        target: 'portable',
        arch: ['x64', 'ia32'],
      },
    ],
  },
  linux: {
    icon: 'assets/favicon/favicon-desktop-app.png',
    category: 'Office',
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      {
        target: 'deb',
        arch: ['x64'],
      },
      {
        target: 'rpm',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  publish: {
    provider: 'github',
    owner: 'Lumin',
    repo: 'lumin-web-viewer',
  },
  generateUpdatesFilesForAllChannels: false,
};
