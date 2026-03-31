import { AnnotationSubjectMapping } from 'constants/documentConstants';
import TOOLS_NAME from 'constants/toolsName';

import { IconStampCreateTool } from './IconStampCreateTool';

export class DotStampCreateTool extends IconStampCreateTool {
  imageData: string;

  iconName: string;

  annotationSubject: string;

  constructor(docViewer: Core.DocumentViewer) {
    super(docViewer);
    this.name = TOOLS_NAME.DOT_STAMP;

    this.iconName = 'stamp-dot';
    this.annotationSubject = AnnotationSubjectMapping.dotStamp;
  }
}
