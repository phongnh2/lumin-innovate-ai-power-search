/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { TFunction } from 'i18next';

import selectors from 'selectors';
import { store } from 'store';

import verifyDocumentDigitalSigned from 'helpers/verifyDocumentDigitalSigned';

import { isNeedApplyOCR } from './checkDocAppliedOCR';
import { checkPlanRestrictions } from './planRestrictionsChecker';
import {
  CHATBOT_TOOL_NAMES,
  OCR_LINK,
  RESTRICTION_TYPES,
  STORAGE_TOOL_RESTRICTIONS,
  TOOL_APPLY_OCR,
} from '../constants';
import { setMessageRestriction } from '../slices';
import { ToolCallType } from '../types';

export const getRestrictionMessage = async ({ t, toolCall }: { t: TFunction; toolCall: ToolCallType }) => {
  const currentDocument = selectors.getCurrentDocument(store.getState());
  const featureName = t(`viewer.chatbot.feature.${toolCall.toolName}`);
  for (const restrictionType of Object.values(RESTRICTION_TYPES)) {
    switch (restrictionType) {
      case RESTRICTION_TYPES.PLAN: {
        const planRestrictions = checkPlanRestrictions({ toolCall, t });
        if (planRestrictions) {
          store.dispatch(setMessageRestriction(planRestrictions));
          return planRestrictions;
        }
        break;
      }
      case RESTRICTION_TYPES.STORAGE: {
        const documentStorage = currentDocument?.service;
        if (documentStorage && STORAGE_TOOL_RESTRICTIONS[documentStorage]?.includes(toolCall.toolName)) {
          return t('viewer.chatbot.restrictions.storage', { featureName });
        }
        break;
      }
      case RESTRICTION_TYPES.DIGITAL_SIGNED: {
        const isDocumentDigitalSigned = await verifyDocumentDigitalSigned();
        if (isDocumentDigitalSigned && toolCall.toolName === CHATBOT_TOOL_NAMES.EDIT_TEXT) {
          return t('viewer.chatbot.restrictions.digitalSigned');
        }
        break;
      }
      case RESTRICTION_TYPES.OCR: {
        if (TOOL_APPLY_OCR.includes(toolCall.toolName)) {
          const needApplyOCR = await isNeedApplyOCR(currentDocument);
          if (needApplyOCR) {
            return t('viewer.chatbot.needApplyOCR', {
              src: OCR_LINK,
            });
          }
        }
        break;
      }
      default: {
        return null;
      }
    }
  }

  return null;
};
