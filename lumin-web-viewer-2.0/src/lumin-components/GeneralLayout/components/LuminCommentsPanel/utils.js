import core from 'core';

export function getAllPagesHeight() {
  let totalPagesHeight = 0;
  const totalPages = core.getTotalPages();
  for (let index = 1; index <= totalPages; index++) {
    const pageContainer = document.getElementById(`pageContainer${index}`);
    if (!pageContainer) {
      // eslint-disable-next-line no-continue
      continue;
    }
    totalPagesHeight += pageContainer.offsetHeight;
  }
  return totalPagesHeight;
}

export const calculateNotePosition = (annot) => {
  let annotY;
  const pageRotate = core.getDocument().getPageRotation(annot.PageNumber);
  const { height: pageHeight } = core.getPageInfo(annot.PageNumber);
  let totalLastPageHeight = 0;
  switch (pageRotate) {
    case 90:
      annotY = annot.X;
      break;
    case 180:
      annotY = pageHeight - annot.Y;
      break;
    case 270:
      annotY = pageHeight - annot.X;
      break;
    default:
      annotY = annot.Y;
      break;
  }

  for (let index = 1; index < annot.PageNumber; index++) {
    totalLastPageHeight += core.getPageInfo(index).height + 7.5;
  }

  return {
    top: parseInt((totalLastPageHeight + annotY) * core.getZoom()),
  };
};