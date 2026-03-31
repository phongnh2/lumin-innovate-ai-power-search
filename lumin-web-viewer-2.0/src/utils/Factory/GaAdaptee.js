import { merge } from 'lodash';

import { GA4_ID } from 'constants/urls';

class GaAdaptee {
  // eslint-disable-next-line class-methods-use-this
  receive = ({
    name,
    parameters,
  }) => {
    if (window.gtag) {
      window.gtag('event', name, merge(parameters, { send_to: GA4_ID }));
    }
  };
}

export default GaAdaptee;
