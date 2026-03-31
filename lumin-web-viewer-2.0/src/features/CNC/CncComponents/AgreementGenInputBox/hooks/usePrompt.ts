import { RefObject, useState } from 'react';

import { useGetCurrentOrganization } from 'hooks';

import { eventTracking } from 'utils';
import {
  convertQueryStringToObject,
  MAX_PINPOINT_VALUE_CHARACTER,
  sliceAllObjectValues,
} from 'utils/getCommonAttributes';

import {
  PROMPT_TYPE,
  CONTEXT,
  AGREEMENT_GEN_EVENTS,
  EXAMPLES_PROMPT_AGREEMENT,
} from 'features/CNC/constants/agreementGenConstants';
import { objectToBase64 } from 'features/CNC/helpers/objectToBase64';
import {
  removeSquareBracketFromPrompt,
  removeSquareBracketFromSamplePrompt,
} from 'features/CNC/helpers/removeSquareBracketFromPrompt';
import AgreementGenServices from 'features/CNC/services/agreementGen';

import { AGREEMENT_GEN_APP_URL } from 'constants/urls';

export const usePrompt = (
  ref: RefObject<HTMLDivElement>,
  selectedPrompt: string | null,
  setIsOpenAgreementPromptModal?: (isOpenAgreementPromptModal: boolean) => void
) => {
  const { url } = useGetCurrentOrganization();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const createAgreementByPrompt = async () => {
    setIsProcessing(true);
    try {
      let promptType: typeof PROMPT_TYPE[keyof typeof PROMPT_TYPE] = PROMPT_TYPE.CUSTOM_PROMPT;
      let promptId: number | null = null;
      const promptWithoutSquareBrackets = removeSquareBracketFromPrompt(ref.current);
      if (selectedPrompt) {
        const { promptMessage: selectedPromptMessage, id } =
          EXAMPLES_PROMPT_AGREEMENT.find((prompt) => prompt.title === selectedPrompt) ?? {};
        const samplePromptWithoutSquareBracket = removeSquareBracketFromSamplePrompt(selectedPromptMessage);
        promptType =
          samplePromptWithoutSquareBracket === promptWithoutSquareBrackets
            ? PROMPT_TYPE.SAMPLE_PROMPT_ORIGINAL
            : PROMPT_TYPE.SAMPLE_PROMPT_REVISED;
        promptId = id;
      }
      const { workspaceUrl, id } = await AgreementGenServices.createByPrompt(
        promptWithoutSquareBrackets,
        objectToBase64({
          prompt_type: promptType,
          sample_prompt_id: promptId,
          context: CONTEXT.LUMINPDF_HOMEPAGE,
          ...(sliceAllObjectValues(
            {
              ...convertQueryStringToObject(),
              referrer: document.referrer,
            },
            MAX_PINPOINT_VALUE_CHARACTER
          ) as Record<string, string>),
        }),
        url
      );
      eventTracking(AGREEMENT_GEN_EVENTS.GENERATE_RESPONSE, {
        prompt_type: promptType,
        sample_prompt_id: promptId?.toFixed(1),
        context: CONTEXT.LUMINPDF_HOMEPAGE,
        prompt_length: promptWithoutSquareBrackets.length,
        prompt_content: promptWithoutSquareBrackets,
        request_from: 'prompt-to-agreement',
        referrer: document.referrer,
      }).catch(() => {});
      window.open(`${AGREEMENT_GEN_APP_URL}/workspace/${workspaceUrl}/document/${id}`);
    } finally {
      setIsProcessing(false);
      setIsOpenAgreementPromptModal?.(false);
    }
  };

  return { createAgreementByPrompt, isProcessing };
};
