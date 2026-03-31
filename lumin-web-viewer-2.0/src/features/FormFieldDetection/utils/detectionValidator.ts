import core from 'core';

import { FORM_FIELD_INDICATORS_REGEX, TOTAL_PAGES_LIMIT } from '../constants/detectionField.constant';

export const isValidDocumentSize = (totalPages: number) => totalPages <= TOTAL_PAGES_LIMIT;

export const hasFormFields = () =>
  core.getAnnotationsList().some((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation);

export const hasFormFieldIndicator = (textContent: string) => FORM_FIELD_INDICATORS_REGEX.test(textContent.toLowerCase());
