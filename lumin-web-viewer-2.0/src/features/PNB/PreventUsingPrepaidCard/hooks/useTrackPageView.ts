import { isEmpty, isObject } from 'lodash';

import appEvent from 'utils/Factory/EventCollection/AppEventCollection';

const useTrackPageView = () => {
  const trackPageView = (attributes?: Record<string, any>) => {
    const attrs = isObject(attributes) && !isEmpty(attributes) ? attributes : {};
    appEvent.pageView(attrs).catch(() => {});
  };

  return { trackPageView };
};

export default useTrackPageView;
