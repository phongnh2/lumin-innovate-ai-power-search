/**
 * Editor: Using hash color to draw sticky annotation
 */
const DEFAULT_AVATAR_COLORS = ['#f2385a', '#da6668', '#fab1a5', '#20c9ad', '#f2be38', '#77c2d7', '#4690a4', '#f178b6'];
export const hashColorFromUserName = (userName) => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash += userName.charCodeAt(i);
  }
  const indexOfColor = hash % 8;
  return DEFAULT_AVATAR_COLORS[indexOfColor];
};
