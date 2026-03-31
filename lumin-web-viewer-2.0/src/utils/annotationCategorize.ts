import core from 'core';

import { AnnotationSubjectMapping } from 'constants/documentConstants';

export class AnnotationCategorize {
  static isLinkAnnotation = (annotation: Partial<{ Subject: string }>): boolean =>
    annotation.Subject === AnnotationSubjectMapping.link;

  static isHighlightAnnotation = (annotation: Partial<{ Subject: string }>): boolean =>
    annotation.Subject === AnnotationSubjectMapping.highlight;

  static isLinkAnnotationDeselected = ({
    annotations,
    action,
  }: {
    annotations: Partial<{ Subject: string }>[];
    action: string;
  }): boolean => annotations.every((annot) => AnnotationCategorize.isLinkAnnotation(annot) && action === 'deselected');

  static isRedactionAnnotation = (annotation: Partial<{ Id: string }>): boolean => {
    const isRedactAnnotation = annotation instanceof window.Core.Annotations.RedactionAnnotation;
    const isNotDeleted = core.getAnnotationsList().some((annot) => annot.Id === annotation.Id);
    return isRedactAnnotation && isNotDeleted;
  };

  static isRedactionAnnotationDeselected = ({
    annotations,
    action,
  }: {
    annotations: Partial<{ Id: string }>[];
    action: string;
  }): boolean => annotations.every(AnnotationCategorize.isRedactionAnnotation) && action === 'deselected';
}
