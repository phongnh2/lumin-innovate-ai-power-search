import { AnnotationSubjectMapping } from 'constants/documentConstants';
import TOOLS_NAME from 'constants/toolsName';

import { IconStampCreateTool } from './IconStampCreateTool';

export class CrossStampCreateTool extends IconStampCreateTool {
  imageData: string;

  iconName: string;

  annotationSubject: string;

  constructor(docViewer: Core.DocumentViewer) {
    super(docViewer);
    this.name = TOOLS_NAME.CROSS_STAMP;

    this.iconName = 'stamp-cross';
    this.annotationSubject = AnnotationSubjectMapping.crossStamp ;
  }
}
