import { CUSTOM_PROMPT_TYPE } from 'constants/customConstant';

export default function getCustomPrompt(hasAppliedRedaction: boolean, isInContentEditMode: boolean): string {
  if (hasAppliedRedaction) {
    return CUSTOM_PROMPT_TYPE.REDACTION;
  }
  if (isInContentEditMode) {
    return CUSTOM_PROMPT_TYPE.CONTENT_EDIT;
  }
  return CUSTOM_PROMPT_TYPE.DEFAULT;
}
