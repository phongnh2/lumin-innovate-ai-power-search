const fs = require('fs');

// Get the commit message file path
const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('No commit message file path provided.');
  process.exit(1);
}

if (!fs.existsSync(commitMsgFile)) {
  console.error('Commit message file does not exist:', commitMsgFile);
  process.exit(1);
}

const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim();

// Define your commit prefixes and corresponding emojis
const prefixes = {
  feat: '✨',
  fix: '🐛',
  refactor: '♻️',
  'BREAKING CHANGE': '🚀',
  test: '✅',
  chore: '⚡️',
  revert: '⏪',
  hotfix: '🚑️',
  wip: '🚧',
  enhance: '⭐',
  docs: '📝',
  config: '🔧',
  security: '🔒',
  perf: '⚡️',
};

// Function to prepend emoji based on the commit prefix
function prependEmoji(message) {
  const prefix = Object.keys(prefixes).find((p) => message.startsWith(p));
  if (prefix) {
    return `${prefixes[prefix]} ${message}`;
  }
  return message;
}

// Write the updated commit message back to the file
const updatedMsg = prependEmoji(commitMsg);
fs.writeFileSync(commitMsgFile, updatedMsg);
