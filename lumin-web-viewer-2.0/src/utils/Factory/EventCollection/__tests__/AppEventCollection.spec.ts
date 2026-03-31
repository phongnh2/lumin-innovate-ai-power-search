import { AppEventCollection } from '../AppEventCollection';
import { AWS_EVENTS } from 'constants/awsEvents';

jest.mock('../EventCollection', () => {
  return {
    EventCollection: class {
      record = jest.fn();
    },
  };
});

describe('AppEventCollection', () => {
  let appEvent: AppEventCollection;

  beforeEach(() => {
    appEvent = new AppEventCollection();
  });

  it('should record downloadPWA event', () => {
    appEvent.downloadPWA();

    expect(appEvent.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.DOWNLOAD_APP,
      attributes: {
        appTypeToDownload: 'PWA',
      },
    });
  });

  it('should record pageView event with attributes', () => {
    const attrs = { page: 'home', foo: 'bar' };

    appEvent.pageView(attrs);

    expect(appEvent.record).toHaveBeenCalledWith({
      name: AWS_EVENTS.PAGE_VIEW,
      attributes: attrs,
    });
  });
});
