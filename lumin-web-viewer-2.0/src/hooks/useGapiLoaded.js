import { useSelector } from 'react-redux';

import selectors from 'selectors';

export function useGapiLoaded() {
  return useSelector(selectors.hasGapiLoaded);
}
