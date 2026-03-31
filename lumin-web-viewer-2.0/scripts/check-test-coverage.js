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
  // DocumentList Core
  'src/lumin-components/DocumentList/DocumentList.js',
  'src/lumin-components/DocumentList/DocumentListRenderer.js',
  'src/lumin-components/DocumentList/HOC/withDocumentModal.js',
  'src/lumin-components/DocumentList/HOC/withOpenDocDecorator.js',

  // DocumentItem Core
  'src/lumin-components/DocumentItem/DocumentItem.js',
  'src/lumin-components/DocumentItem/DocumentItemContainer.js',
  'src/lumin-components/DocumentItem/components/DocumentListItem/',
  'src/lumin-components/DocumentItem/components/DocumentGridItem/',

  // Virtualization & Core UI
  'src/lumin-components/VirtualizedGrid/VirtualizedGrid.js',
  'src/lumin-components/VirtualizedList/VirtualizedList.js',
  'src/lumin-components/DocumentListHeader/',
  'src/lumin-components/DocumentQuery/',
  'src/lumin-components/DocumentQuery/DocumentQuery.js',
  'src/lumin-components/DocumentQuery/DocumentQueryProxy.js',
  'src/lumin-components/DocumentItemPopper/',
  'src/lumin-components/DocumentListHeaderBar/HOC/withDocumentHeaderAction.js',
  'src/lumin-components/ReskinLayout/components/DocumentSelectionBar/',

  // Core Services
  'src/services/paymentService.js',
  'src/services/organizationServices.js',
  'src/services/documentServices.js',
  'src/services/uploadServices.js',
  'src/services/googleServices.js',
  'src/services/oneDriveServices/',
  'src/services/dropboxServices.js',
  'src/services/personalDocumentUploadService.ts',
  'src/services/authServices.js',
  'src/services/graphServices/payment.js',
  'src/services/graphServices/documentGraphServices.js',

  // Core Utils
  'src/utils/paymentUtil.js',
  'src/utils/file.js',
  'src/utils/getFileService.js',
  'src/utils/manipulation.js',
  'src/utils/uploadUtils.js',
  'src/utils/checkDocumentRole.js',
  'src/utils/payment/payment.ts',
  'src/utils/Factory/DocumentPermissions/base.ts',

  // Core Hooks
  'src/hooks/usePaymentPermissions.js',
  'src/hooks/useRetrieveRemainingPlan.js',
  'src/hooks/useClaimFreeTrial.js',
  'src/hooks/useUpdateUserSubscription.js',
  'src/hooks/useRequestPermissionChecker.js',

  // Payment Components
  'src/lumin-components/PaymentTempBilling/',
  'src/lumin-components/BillingDetail/',

  // Transfer Operations
  'src/lumin-components/TransferDocument/',
  'src/lumin-components/TransferDocument/CopyDocumentModal/',
  'src/lumin-components/TransferDocument/MoveDocumentModal/',
  'src/lumin-components/TransferDocument/UploadDocumentModal/',
  'src/lumin-components/ShareModal/',

  // External Upload Features
  'src/features/DocumentUploadExternal/',
  'src/features/DocumentUploadExternal/useUploadFile.ts',
  'src/features/MultipleDownLoad/',

  // HOCs
  'src/HOC/withDocumentItemAuthorization/',
];

const high = [
  // DocumentList Supporting
  'src/lumin-components/DocumentList/Context.js',
  'src/lumin-components/DocumentList/HOC/withCurrentDocuments.js',
  'src/lumin-components/DocumentList/HOC/withResetSelectedState.js',
  'src/lumin-components/DocumentList/hooks/useAuthenticateService.js',
  'src/lumin-components/DocumentList/hooks/useFindDocumentLocation.ts',
  'src/lumin-components/DocumentList/hooks/useCloseContextMenuOnScroll.ts',

  // DocumentItem Supporting
  'src/lumin-components/DocumentItem/components/DocumentName/',
  'src/lumin-components/DocumentItem/components/DocumentThumbnail/',
  'src/lumin-components/DocumentItem/components/DocumentOwnerName/',
  'src/lumin-components/DocumentItem/components/DocumentActionButton/',

  // UI Components
  'src/lumin-components/DocumentSkeleton/',
  'src/lumin-components/DocumentComponents/',
  'src/lumin-components/DocumentLayoutType/',
  'src/lumin-components/FailedFetchError/',
  'src/lumin-components/EmptyDocumentList/',

  // Search Components
  'src/features/HomeSearch/components/SearchResult/',
  'src/features/HomeSearch/components/DocumentItem/',
  'src/features/HomeSearch/components/DocumentListHeader/',
  'src/features/HomeSearch/components/DocumentSkeleton/',

  // Supporting Hooks
  'src/hooks/useCurrentBillingClient.js',
  'src/hooks/useMatchPaymentRoute.ts',
  'src/hooks/useDocumentPermission.js',
  'src/hooks/useDesktopMatch.js',
  'src/hooks/useTabletMatch.js',
  'src/hooks/useGetFolderType.js',
  'src/hooks/useScrollToElement.ts',
  'src/hooks/useAutoSync.ts',
  'src/hooks/useTransferFile.ts',
  'src/hooks/useUploadOptions.ts',

  // Supporting Components
  'src/lumin-components/StripePaymentForm/',
  'src/lumin-components/SettingBillingForm/',
  'src/lumin-components/BulkUpdateSharePermission/',
  'src/lumin-components/UploadDropZone/',
  'src/lumin-components/UploadingDocumentList/',

  // Supporting Features
  'src/features/ShareInSlack/',
  'src/features/OneDriveAddInsAuthorization/',

  // Supporting HOCs
  'src/HOC/withStripeElements.js',
  'src/HOC/withAuthGuard.tsx',
  'src/HOC/withAuthRoute.tsx',
  'src/HOC/withUploadHandler.js',
  'src/HOC/withSharingQueue.tsx',
  'src/HOC/SystemStorageHOC/',
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
    'src/utils/syncFileToS3.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/utils/syncFileEditText.js': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/helpers/autoSync.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/hooks/useAutoSync.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
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
    'src/features/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/services/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/utils/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/helpers/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/hooks/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/lumin-components/PDFViewer/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'src/ui/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
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
  const coverageSummaryPath = path.join(__dirname, '../src/coverage/coverage-summary.json');
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
