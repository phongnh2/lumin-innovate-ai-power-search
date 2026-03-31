export const MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN_IN_MB = 20;

export const MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN =
  MAXIMUM_FILE_SIZE_FOR_EDIT_IN_AGREEMENT_GEN_IN_MB * 1024 * 1024;

export const AgreementApi = {
  CreateFromLlmPrompt: '/workspace/{workspaceUrl}/agreement/create-from-llm-prompt',
};
