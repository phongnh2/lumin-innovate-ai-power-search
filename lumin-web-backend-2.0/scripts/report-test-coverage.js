const fs = require('fs');
const path = require('path');

const COVERAGE_METRICS_COUNT = 4;

const PRIORITY_EMOJIS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

const critical = [
  // Auth
  'src/Auth/auth.service.ts',
  
  // Document
  'src/Document/document.service.ts',
  'src/Document/document.controller.ts',
  'src/Document/document.resolver.ts',
  'src/Document/documentSync.service.ts',
  'src/Document/documentOutline.service.ts',
  
  // Organization
  'src/Organization/resolvers/organization.resolver.ts',
  'src/Organization/resolvers/private/organization.private.resolver.ts',
  'src/Organization/resolvers/public/organization.public.resolver.ts',
  'src/Organization/organization.service.ts',
  'src/Organization/organization.docStack.service.ts',
  'src/Organization/organization.inviteLink.service.ts',
  'src/Organization/organization.payment.service.ts',
  
  // OpenGoogle
  'src/OpenGoogle/OpenGoogle.controller.ts',
  'src/OpenGoogle/OpenGoogle.service.ts',
  
  // OpenOneDrive
  'src/OpenOneDrive/OpenOneDrive.service.ts',
  'src/OpenOneDrive/OpenOneDrive.controller.ts',
  
  // Payment
  'src/Payment/payment.resolver.ts',
  'src/Payment/payment.service.ts',
  'src/Payment/payment.controller.ts',
  
  // User
  'src/User/user.service.ts',
  'src/User/user.controller.ts',
  
  // AWS
  'src/Aws/aws.service.ts',
];

const high = [
  // Organization Team
  'src/Organization/organizationTeam.service.ts',
  'src/Organization/resolvers/public/organizationTeam.public.resolver.ts',
  'src/Organization/resolvers/private/organizationTeam.private.resolver.ts',
  
  // OpenGoogle
  'src/OpenGoogle/EventTracking.service.ts',
  
  // Slack
  'src/Slack/slack.service.ts',
  
  // Folder
  'src/Folder/folder.service.ts',
  
  // Braze
  'src/Braze/braze.service.ts',
];

const COVERAGE_THRESHOLDS = {
  global: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60,
  },
  critical: {
    ...critical.reduce((acc, module) => {
      acc[module] = {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      };
      return acc;
    }, {}),
  },
  high: {
    ...high.reduce((acc, module) => {
      acc[module] = {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      };
      return acc;
    }, {}),
  },
};

function checkGlobalCoverage(coverageData) {
  let totalWarnings = 0;
  if (coverageData.total) {
    const globalCoverage = coverageData.total;
    console.log('🌍 GLOBAL COVERAGE:');
    const globalAvgCoverage =
      (globalCoverage.statements.pct +
        globalCoverage.branches.pct +
        globalCoverage.functions.pct +
        globalCoverage.lines.pct) /
      COVERAGE_METRICS_COUNT;

    Object.entries(COVERAGE_THRESHOLDS.global).forEach(([metric, threshold]) => {
      const actual = globalCoverage[metric].pct;
      if (actual < threshold) {
        console.log(`   ⚠️  ${metric}: ${actual}% (target: ${threshold}%)`);
        totalWarnings++;
      } else {
        console.log(`   ✅ ${metric}: ${actual}% (target: ${threshold}%)`);
      }
    });

    console.log(`   📊 Average: ${globalAvgCoverage.toFixed(1)}%`);
    console.log('');
  }

  return totalWarnings;
}

function getCoverageFilesMap() {
  const coverageFiles = new Map();
  Object.entries(COVERAGE_THRESHOLDS).forEach(([key, value]) => {
    if (key === 'global') {
      return;
    }

    Object.keys(value).forEach((pattern) => {
      coverageFiles.set(pattern, key);
    });
  });

  return coverageFiles;
}

function checkFilesCoverage(coverageData) {
  let totalFiles = 0;
  let criticalWarnings = 0;
  let highWarnings = 0;
  let totalWarnings = 0;

  const coverageFiles = getCoverageFilesMap();

  Object.entries(coverageData).forEach(([filePath, coverage]) => {
    if (filePath === 'total') {
      return;
    }

    totalFiles++;
    const relativePath = filePath.replace(/^.*\/src\//, 'src/');
    // eslint-disable-next-line no-restricted-syntax
    for (const pattern of coverageFiles.keys()) {
      if (relativePath.startsWith(pattern) || relativePath === pattern) {
        coverageFiles.delete(pattern);
        break;
      }
    }

    let priority = 'low';
    let threshold = null;
    if (COVERAGE_THRESHOLDS.critical[relativePath]) {
      priority = 'critical';
      threshold = COVERAGE_THRESHOLDS.critical[relativePath];
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const [pattern, thresholds] of Object.entries(COVERAGE_THRESHOLDS.high)) {
        if (relativePath.includes(pattern.replace('src/', ''))) {
          priority = 'high';
          threshold = thresholds;
          break;
        }
      }
    }

    if (!threshold) {
      return;
    }

    const avgCoverage =
      (coverage.statements.pct + coverage.branches.pct + coverage.functions.pct + coverage.lines.pct) /
      COVERAGE_METRICS_COUNT;
    const avgThreshold =
      (threshold.branches + threshold.functions + threshold.lines + threshold.statements) / COVERAGE_METRICS_COUNT;
    const hasWarning = avgCoverage < avgThreshold;
    if (!hasWarning) {
      return;
    }

    totalWarnings++;
    if (priority === 'critical') {
      criticalWarnings++;
    } else if (priority === 'high') {
      highWarnings++;
    }

    const emoji = PRIORITY_EMOJIS[priority];
    console.log(`${emoji} ${priority.toUpperCase()}: ${relativePath}`);
    console.log(`   📊 Average: ${avgCoverage.toFixed(1)}% (target: ${avgThreshold.toFixed(1)}%)`);
    Object.entries(threshold).forEach(([metric, targetThreshold]) => {
      const actual = coverage[metric].pct;
      const status = actual < targetThreshold ? '❌' : '✅';
      console.log(`   ${status} ${metric}: ${actual}% (target: ${targetThreshold}%)`);
    });

    console.log('');
  });

  if (coverageFiles.size > 0) {
    console.log('\n❌ Some files are not covered:\n');
    // eslint-disable-next-line no-restricted-syntax
    for (const [file, priority] of coverageFiles.entries()) {
      const emoji = PRIORITY_EMOJIS[priority];
      console.log(`${emoji} ${priority.toUpperCase()}: Coverage data for ${file} was not found.\n`);
    }

    console.log('');
  }

  return { totalFiles, criticalWarnings, highWarnings, totalFilesWarnings: totalWarnings };
}

function checkCoverage() {
  const coverageSummaryPath = 'coverage/coverage-summary.json';
  if (!fs.existsSync(coverageSummaryPath)) {
    console.log('❌ Coverage summary not found. Run tests with coverage first.');
    console.log('   npm run test-jest:coverage');
    console.log('\n🚀 Pipeline will continue (coverage check is informational only)');
    process.exit(0);
  }

  try {
    const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    console.log('\nCOVERAGE CHECK');
    console.log('=================\n');
    let totalWarnings = 0;
    const globalWarnings = checkGlobalCoverage(coverageData);
    totalWarnings += globalWarnings;
    const { totalFiles, criticalWarnings, highWarnings, totalFilesWarnings } = checkFilesCoverage(coverageData);
    totalWarnings += totalFilesWarnings;
    console.log('📈 SUMMARY:');
    console.log(`   Files analyzed: ${totalFiles}`);
    console.log(`   Total warnings: ${totalWarnings}`);
    console.log(`   Critical warnings: ${criticalWarnings}`);
    console.log(`   High priority warnings: ${highWarnings}`);
    if (totalWarnings < 1) {
      console.log('\n✅ All files meet their coverage thresholds!');
    }

    console.log('\n🚀 Pipeline will continue (coverage check is informational only)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking coverage:', error.message);
    console.log('🚀 Pipeline will continue despite coverage check error');
    process.exit(0);
  }
}

if (require.main === module) {
  checkCoverage();
}

module.exports = { checkCoverage };
