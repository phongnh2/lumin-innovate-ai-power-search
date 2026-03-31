import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { TOOLS_NAME } from 'constants/toolsName';

export const isCropAnnotation = (annotation: Core.Annotations.Annotation): boolean =>
  annotation.Subject === AnnotationSubjectMapping.rectangle && annotation.ToolName === TOOLS_NAME.CROP_PAGE;
