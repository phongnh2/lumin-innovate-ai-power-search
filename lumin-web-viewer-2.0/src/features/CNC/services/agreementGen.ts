import { createAgreementFromLlmPrompt } from 'features/AgreementGen/apis/createAgreementFromLlmPrompt';

class AgreementGenServices {
  async createByPrompt(prompt: string, event: string, workspaceUrl: string) {
    return createAgreementFromLlmPrompt({ prompt, event, workspaceUrl });
  }
}

export default new AgreementGenServices();
