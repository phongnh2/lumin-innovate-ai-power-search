import { AWS_EVENTS } from 'constants/awsEvents';
import { NOTIFICATION_WIDGET_TYPE } from 'constants/notificationWidgetType';

import { EventCollection } from './EventCollection';

export const MessageName = {
  DOWNLOAD_MOBILE_APP: 'downloadMobileApp',
  DOWNLOAD_PWA_APP: 'downloadPWAApp',
  PROMPT_UPGRADE_TO_PROF: 'promptUpgradeToProf',
  REDACTION_WHAT_NEW: 'redactionWhatNew',
  EDIT_PDF: 'editPDFWhatNew',
  NEW_EDIT_PDF: 'editPDFNewVersion',
  RESTORE_ORIGINAL: 'restoreOriginalVersionWhatNew',
  TEMPLATES: 'templateDiscovery',
};

export const MessagePurpose = {
  [MessageName.DOWNLOAD_MOBILE_APP]: 'Download mobile app message',
  [MessageName.DOWNLOAD_PWA_APP]: 'Download PWA app message',
  [MessageName.PROMPT_UPGRADE_TO_PROF]: 'Prompt user to upgrade to professional',
  [MessageName.REDACTION_WHAT_NEW]: 'Announce redaction to user',
  [MessageName.EDIT_PDF]: 'Announce edit PDF to user',
  [MessageName.NEW_EDIT_PDF]: 'Announce new edit PDF version to user',
  [MessageName.RESTORE_ORIGINAL]: 'Announce restore original version to user',
  [MessageName.TEMPLATES]: 'Announce new template discovery',
};

export const SubEventData = {
  [NOTIFICATION_WIDGET_TYPE.DOWNLOAD_MOBILE_APP]: {
    elementName: 'alreadyHadIt',
    elementPurpose: 'To confirm that user has mobile app on their phone',
  },
};
export class MessageEventCollection extends EventCollection {
  messageViewed({ messageName, messagePurpose }) {
    const attributes = {
      messageName,
      messagePurpose,
    };
    return this.record({
      name: AWS_EVENTS.MESSAGE.VIEWED,
      attributes,
    });
  }

  messageDismissed({ messageName, messagePurpose }) {
    const attributes = {
      messageName,
      messagePurpose,
    };
    return this.record({
      name: AWS_EVENTS.MESSAGE.DISMISSED,
      attributes,
    });
  }

  messageConfirmation({ messageName, messagePurpose }) {
    const attributes = {
      messageName,
      messagePurpose,
    };
    return this.record({
      name: AWS_EVENTS.MESSAGE.CONFIRMATION,
      attributes,
    });
  }

  messageSubAction(attributes) {
    return this.record({
      name: AWS_EVENTS.CLICK,
      attributes,
    });
  }

  messagePreview({ messageName, messagePurpose }) {
    const attributes = {
      messageName,
      messagePurpose,
    };
    return this.record({
      name: AWS_EVENTS.MESSAGE.PREVIEWED,
      attributes,
    });
  }
}

export default new MessageEventCollection();
