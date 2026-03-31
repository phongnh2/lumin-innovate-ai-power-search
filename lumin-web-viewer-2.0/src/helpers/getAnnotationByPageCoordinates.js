import core from 'core';

const getAnnotationByPageCoordinates = (pageCoordinates) =>
  core.getAnnotationsList().find((annot) => {
    if (annot.PageNumber !== pageCoordinates.pageNumber) {
      return false;
    }
    return window.Core.Annotations.SelectionAlgorithm.boundingRectTest(
      annot,
      pageCoordinates.x,
      pageCoordinates.y,
      core.getZoom()
    );
  });

export default getAnnotationByPageCoordinates;