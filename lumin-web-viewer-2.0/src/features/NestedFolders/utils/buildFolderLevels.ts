export function buildFolderLevels(depth: number): string {
  if (depth <= 0) return '';
  const nested = buildFolderLevels(depth - 1);
  return `
    children {
      ...FolderTreeData
      ${nested.trim() ? nested : ''}
    }
  `;
}
