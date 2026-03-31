import core from 'core';

export default (elementScroll, annotation, behavior = 'smooth') => {
  const annotationOnCurrentPage = core.getCurrentPage() === annotation.PageNumber;
  const isContinuousView = core.getDisplayMode() === core.CoreControls.DisplayModes.Continuous;
  if (!annotationOnCurrentPage && !isContinuousView) {
    core.setCurrentPage(annotation.PageNumber);
  }
  const displayMode = core.docViewer.getDisplayModeManager().getDisplayMode();

  const elementHeight = elementScroll.clientHeight;
  const elementWidth = elementScroll.clientWidth;
  const elementCurrentTop = elementScroll.getBoundingClientRect().top + window.pageYOffset;
  const elementCurrentLeft = elementScroll.getBoundingClientRect().left + window.pageXOffset;

  const annotationPoint = {
    x1: annotation.X,
    y1: annotation.Y,
    x2: annotation.X + annotation.Width,
    y2: annotation.Y + annotation.Height,
  };

  const windowPointStart = displayMode.pageToWindow({ x: annotationPoint.x1, y: annotationPoint.y1 }, annotation.PageNumber);
  const windowPointEnd = displayMode.pageToWindow({ x: annotationPoint.x2, y: annotationPoint.y2 }, annotation.PageNumber);

  const minYPoint = windowPointStart.y < windowPointEnd.y ? windowPointStart.y : windowPointEnd.y;
  const maxYPoint = windowPointStart.y > windowPointEnd.y ? windowPointStart.y : windowPointEnd.y;
  const minXPoint = windowPointStart.x < windowPointEnd.x ? windowPointStart.x : windowPointEnd.x;
  const maxXPoint = windowPointStart.x > windowPointEnd.x ? windowPointStart.x : windowPointEnd.x;

  const scrollTop = minYPoint - elementHeight / 2 + (maxYPoint - minYPoint) / 2 - elementCurrentTop;
  const scrollLeft = minXPoint - elementWidth / 2 + (maxXPoint - minXPoint) / 2 - elementCurrentLeft;

  elementScroll.scrollTo({
    top: scrollTop,
    left: scrollLeft,
    behavior,
  });
};
