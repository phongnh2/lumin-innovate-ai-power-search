import i18next from 'i18next';

import { ApplicationType } from '../interfaces';

export const mapAppTypeToTitle = (appType: ApplicationType) => {
  switch (appType) {
    case ApplicationType.SERVER_APPLICATION:
      return i18next.t('developerApi.integrationApps.serverApplication');
    case ApplicationType.CLIENT_APPLICATION:
      return i18next.t('developerApi.integrationApps.clientApplication');
    default:
      return '';
  }
};
