import StarAnnotation from 'helpers/CustomAnnotation/StarAnnotation';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

class StarCreateTool extends window.Core.Tools.GenericAnnotationCreateTool {
  constructor(documentViewer) {
    super(documentViewer, StarAnnotation);
    this.setName(CUSTOM_ANNOTATION.STAR.tool);
    this.documentViewer = documentViewer;
  }

  mouseLeftDown(e) {
    super.mouseLeftDown(e);
    if (this.annotation) {
      this.annotation.Rotation = 90 * this.documentViewer.getCompleteRotation(this.annotation.PageNumber);
    }
  }
}

export default StarCreateTool;
