const path = require('path');

const buildEslintCommand = filenames => `next lint --fix --quiet --file ${filenames
  .map((f) => path.relative(process.cwd(), f))
  .join(' --file ')}`;

module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx)': (filenames) => `yarn tsc -p ./tsconfig.json --noEmit`,

  // Lint TS and JS files
  '**/*.(ts|tsx|js)': buildEslintCommand,
  '**/*.(css|scss|styled.ts|styled.tsx)': 'stylelint --fix --quiet --cache'
};
