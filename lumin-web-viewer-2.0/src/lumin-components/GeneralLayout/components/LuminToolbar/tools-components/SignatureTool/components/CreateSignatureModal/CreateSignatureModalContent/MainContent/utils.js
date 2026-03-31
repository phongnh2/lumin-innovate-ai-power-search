export const convertPtToFontWeight = (pt) => {
  if (pt < 6) {
    return 'normal';
  }
  return 'bold';
};
