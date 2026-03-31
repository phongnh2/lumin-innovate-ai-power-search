import { merge } from 'lodash';

import { environment } from '@/configs/environment';

const receive = ({ name, parameters }: { name: string; parameters: Record<string, string> }) => {
  if (window.gtag) {
    window.gtag('event', name, merge(parameters, { send_to: environment.public.gtag.measurementId }));
  }
};

export default receive;
