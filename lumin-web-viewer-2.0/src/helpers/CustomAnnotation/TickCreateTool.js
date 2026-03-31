import TickAnnotation from 'helpers/CustomAnnotation/TickAnnotation';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

class TickCreateTool extends window.Core.Tools.GenericAnnotationCreateTool {
  constructor(documentViewer) {
    super(documentViewer, TickAnnotation);
    this.setName(CUSTOM_ANNOTATION.TICK.tool);
    this.documentViewer = documentViewer;
  }

  mouseLeftDown(e) {
    super.mouseLeftDown(e);
    if (this.annotation) {
      this.annotation.Rotation = 90 * this.documentViewer.getCompleteRotation(this.annotation.PageNumber);
    }
  }
}

export default TickCreateTool;
