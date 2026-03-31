import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import UserEventConstants from 'constants/eventConstants';

export enum INTEGRATE_LUMIN_SIGN_MODAL {
  INTEGRATION_MODAL = 'integrationModal',
  SIGN_MODAL = 'signModal',
};

export enum INTEGRATE_BUTTON_NAME {
  REQUEST_SIGNATURES = 'requestSignatures',
  SIGN_SEND = 'sendAndSign',
  SHARE = 'headerButton',
  INVITE_PEOPLE = 'invitePeople',
  SEND_FOR_SIGNATURES = 'sendForSignatures',
  VIEW_REQUEST_SIGNATURES = 'viewRequestSignatures',
  VIEW_SEND_FOR_SIGNATURES = 'viewSendForSignatures',
};

const OPEN_WITH_LUMIN_SIGN = ButtonPurpose[ButtonName.SEND_AND_SIGN];

export const INTEGRATE_BUTTON_EVENT = {
  [INTEGRATE_BUTTON_NAME.REQUEST_SIGNATURES]: {
    eventType: UserEventConstants.EventType.CLICK,
    elementName: INTEGRATE_BUTTON_NAME.REQUEST_SIGNATURES,
    elementPurpose: OPEN_WITH_LUMIN_SIGN,
  },
  [INTEGRATE_BUTTON_NAME.SIGN_SEND]: {
    eventType: UserEventConstants.EventType.CLICK,
    elementName: INTEGRATE_BUTTON_NAME.SIGN_SEND,
    elementPurpose: OPEN_WITH_LUMIN_SIGN,
  },
  [INTEGRATE_BUTTON_NAME.SHARE]: {
    eventType: UserEventConstants.EventType.HEADER_BUTTON,
    elementName: 'Share',
    elementPurpose: '_',
  },
  [INTEGRATE_BUTTON_NAME.INVITE_PEOPLE]: {
    eventType: UserEventConstants.EventType.CLICK,
    elementName: INTEGRATE_BUTTON_NAME.INVITE_PEOPLE,
    elementPurpose: 'Open share modal',
  },
  [INTEGRATE_BUTTON_NAME.SEND_FOR_SIGNATURES]: {
    eventType: UserEventConstants.EventType.CLICK,
    elementName: INTEGRATE_BUTTON_NAME.SEND_FOR_SIGNATURES,
    elementPurpose: OPEN_WITH_LUMIN_SIGN,
  },
  [INTEGRATE_BUTTON_NAME.VIEW_REQUEST_SIGNATURES]: {
    eventType: UserEventConstants.EventType.BUTTON_VIEW,
    buttonName: INTEGRATE_BUTTON_NAME.REQUEST_SIGNATURES,
    buttonPurpose: OPEN_WITH_LUMIN_SIGN,
  },
  [INTEGRATE_BUTTON_NAME.VIEW_SEND_FOR_SIGNATURES]: {
    eventType: UserEventConstants.EventType.BUTTON_VIEW,
    buttonName: INTEGRATE_BUTTON_NAME.SEND_FOR_SIGNATURES,
    buttonPurpose: OPEN_WITH_LUMIN_SIGN,
  },
};
