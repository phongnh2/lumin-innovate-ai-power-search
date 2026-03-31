const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const branchArg = args.find((arg) => arg.startsWith('--branch='));
const branch = branchArg ? branchArg.split('=')[1] : process.env.LUMIN_BRANCH || '';
const isDev = process.env.NODE_ENV === 'development';

// Only generate config for production builds
if (isDev) {
  console.log('🔧 Development mode: Skipping electron-config.json generation');
  process.exit(0);
}

if (!branch) {
  console.error('🚨 Branch is required');
  process.exit(1);
}

console.log(`📦 Generating Electron config for branch: ${branch}`);

const config = {
  branch,
  generatedAt: new Date().toISOString(),
};

const outputPath = path.join(__dirname, '../electron/electron-config.json');
const jsonContent = JSON.stringify(config, null, 2);

fs.writeFileSync(outputPath, jsonContent, 'utf8');

console.log(`✅ Electron config saved to: ${outputPath}`);
console.log(`   Branch: ${branch}`);
