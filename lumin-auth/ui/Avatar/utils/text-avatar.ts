export function getTextAvatar(targetName: string) {
  if (!targetName) return null;
  const nameArray = targetName.split(' ');
  if (nameArray.length > 1) {
    const firstCharacter = nameArray[0].charAt(0);
    const lastCharacter = nameArray[nameArray.length - 1].charAt(0);
    return firstCharacter + lastCharacter;
  }
  return targetName.slice(0, 1);
}
