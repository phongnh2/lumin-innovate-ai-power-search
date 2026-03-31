#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const logFile = path.resolve(__dirname, '../build-performance.log');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function getMostRecentBuildTime() {
  try {
    const log = fs.readFileSync(logFile, 'utf8');
    const lines = log.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes('Build Time:')) {
      const match = lastLine.match(/Build Time: ([\d.]+)s/);
      return match ? parseFloat(match[1]) : null;
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
  return null;
}

function measureBuildSize() {
  if (!fs.existsSync(buildDir)) {
    console.log('Build directory not found. Run a build first.');
    return null;
  }

  let totalSize = 0;
  const files = [];

  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        walkDir(itemPath);
      } else {
        totalSize += stats.size;
        const relativePath = path.relative(buildDir, itemPath);
        files.push({
          path: relativePath,
          size: stats.size,
          formattedSize: formatBytes(stats.size),
        });
      }
    });
  }

  walkDir(buildDir);

  // Sort files by size (largest first)
  files.sort((a, b) => b.size - a.size);

  return {
    totalSize,
    formattedTotalSize: formatBytes(totalSize),
    files: files.slice(0, 10), // Top 10 largest files
  };
}

function logPerformance(buildTime, buildSize) {
  const timestamp = new Date().toISOString();
  const previousBuildTime = getMostRecentBuildTime();

  let logEntry = `${timestamp} - Build Time: ${buildTime}s`;

  if (buildSize) {
    logEntry += ` - Total Size: ${buildSize.formattedTotalSize}`;
  }

  if (previousBuildTime !== null) {
    const improvement = previousBuildTime - buildTime;
    const percentage = ((improvement / previousBuildTime) * 100).toFixed(1);
    logEntry += ` - Time Change: ${improvement > 0 ? '-' : '+'}${Math.abs(improvement).toFixed(1)}s (${
      improvement > 0 ? '-' : '+'
    }${Math.abs(percentage)}%)`;
  }

  logEntry += '\n';

  fs.appendFileSync(logFile, logEntry);
  console.log(`📊 Build Performance Logged: ${logEntry.trim()}`);
}

function main() {
  const command = process.argv[2];

  if (command === 'measure') {
    console.log('🔍 Measuring current build...');
    const buildSize = measureBuildSize();

    if (buildSize) {
      console.log(`\n📦 Build Size Analysis:`);
      console.log(`Total Size: ${buildSize.formattedTotalSize}`);
      console.log(`\n🏆 Largest Files:`);
      buildSize.files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.path} - ${file.formattedSize}`);
      });
    }
  } else if (command === 'log') {
    const buildTime = parseFloat(process.argv[3]);
    if (isNaN(buildTime)) {
      console.error('❌ Please provide build time in seconds');
      process.exit(1);
    }

    const buildSize = measureBuildSize();
    logPerformance(buildTime, buildSize);
  } else {
    console.log(`
📊 Build Performance Measurement Tool

Usage:
  node scripts/measure-build-performance.js measure    # Analyze current build
  node scripts/measure-build-performance.js log <time>  # Log build time and size

Examples:
  node scripts/measure-build-performance.js measure
  node scripts/measure-build-performance.js log 45.2
    `);
  }
}

main();
