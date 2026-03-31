import { AnnotationSubjectMapping } from 'constants/documentConstants';
import TOOLS_NAME from 'constants/toolsName';

import { IconStampCreateTool } from './IconStampCreateTool';

export class TickStampCreateTool extends IconStampCreateTool {
  imageData: string;

  iconName: string;

  annotationSubject: string;

  constructor(docViewer: Core.DocumentViewer) {
    super(docViewer);
    this.name = TOOLS_NAME.TICK_STAMP;

    this.iconName = 'stamp-tick';

    this.annotationSubject = AnnotationSubjectMapping.tickStamp ;
  }
}
