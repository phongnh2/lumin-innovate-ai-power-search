import { UiNode, UiNodeInputAttributes, UiText } from '@ory/client';

import { SelfServiceFlow } from '@/interfaces/ory';
import { OryResponseCode } from '@/lib/ory/errors';

type TField = 'password' | 'email' | 'misc' | 'none';

export type ErrorMessage = {
  id: number | string;
  field: TField;
  message: string;
  ext?: Record<string, unknown>;
};

const parseErrorFromUiMessage = (msg: UiText): ErrorMessage => {
  let field: TField = 'misc';

  if (msg.id === OryResponseCode.EMAIL_EXISTS) {
    field = 'email';
  }

  return {
    id: msg.id,
    field,
    message: msg.text
  };
};

const parseErrorFromUiNode = (node: UiNode): ErrorMessage[] => {
  return node.messages.map(msg => ({
    id: msg.id,
    field: ((node.attributes as UiNodeInputAttributes)?.name as TField) || 'misc',
    message: msg.text
  }));
};

// TODO: simplify ory error message handling
export class ValidationError {
  constructor(private readonly _flow?: SelfServiceFlow, private readonly _error?: { error: Record<string, unknown>; redirect_browser_to: string }) {}

  static fromSelfServiceFlow(flow: SelfServiceFlow) {
    return new this(flow);
  }

  static fromRawError(error: { error: Record<string, unknown>; redirect_browser_to: string }) {
    return new this(undefined, error);
  }

  flow() {
    return this._flow;
  }

  messages(): ErrorMessage[] {
    if (this._flow) {
      const { ui } = this._flow;

      const messages = ui.messages?.map(msg => parseErrorFromUiMessage(msg)) || [];
      return messages.concat(ui.nodes.flatMap(node => parseErrorFromUiNode(node)));
    }

    if (this._error) {
      return [
        {
          id: this._error.error.id as string,
          message: this._error.error.message as string,
          field: 'none',
          ext: {
            redirect_browser_to: this._error.redirect_browser_to
          }
        }
      ];
    }

    return [];
  }
}
