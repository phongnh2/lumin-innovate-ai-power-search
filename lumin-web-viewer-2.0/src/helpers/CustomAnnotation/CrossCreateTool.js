import CrossAnnotation from 'helpers/CustomAnnotation/CrossAnnotation';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

class CrossCreateTool extends window.Core.Tools.GenericAnnotationCreateTool {
  constructor(documentViewer) {
    super(documentViewer, CrossAnnotation);
    this.setName(CUSTOM_ANNOTATION.CROSS.tool);
  }
}

export default CrossCreateTool;
