import { shallowEqual, useSelector } from 'react-redux';

import { RootState } from 'store';

export const useShallowSelector = <TSelector>(selector: (state: RootState) => TSelector) =>
  useSelector<unknown, TSelector>(selector, shallowEqual);

export default useShallowSelector;
