import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const TRACKING_INCLUDE_KEYS = {
  APP_INFO: 'appInfo',
  DOCUMENT_ID: 'documentId',
} as const;

export interface MiniAppTrackingProps {
  eventName: string;
  attributes: Record<string, unknown>;
  includeKeys?: string[];
}

const tracking = ({ eventName, attributes, includeKeys = [] }: MiniAppTrackingProps) => {
  fireEvent(CUSTOM_EVENT.MINIAPP_TRACKING, { eventName, attributes, includeKeys });
};

export { tracking };
