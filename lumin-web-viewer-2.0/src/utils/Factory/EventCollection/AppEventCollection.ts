import { AWS_EVENTS } from 'constants/awsEvents';

import { EventCollection } from './EventCollection';

export class AppEventCollection extends EventCollection {
  downloadPWA() {
    return this.record({
      name: AWS_EVENTS.DOWNLOAD_APP,
      attributes: {
        appTypeToDownload: 'PWA',
      },
    });
  }

  pageView(attributes: Record<string, any>) {
    return this.record({
      name: AWS_EVENTS.PAGE_VIEW,
      attributes,
    });
  }
}

export default new AppEventCollection();
