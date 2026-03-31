import { useMedia } from 'react-use';

import { Breakpoints } from 'constants/styles';

export function useLargeDesktopMatch() {
  return useMedia(`(min-width: ${Breakpoints.xxxl}px)`);
}
