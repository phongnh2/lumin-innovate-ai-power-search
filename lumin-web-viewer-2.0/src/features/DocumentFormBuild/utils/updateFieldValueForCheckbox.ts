import { CHECKBOX_DEFAULT_VALUE } from 'constants/formBuildTool';

export function updateFieldValueForCheckbox(formFieldAnnotation: Core.Annotations.Annotation, value: string) {
  formFieldAnnotation.setCustomData(CHECKBOX_DEFAULT_VALUE, value);
}
