import { useMedia } from 'react-use';

import { Breakpoints } from 'constants/styles';

export function useTabletMatch() {
  return useMedia(`(min-width: ${Breakpoints.md}px)`);
}

export function useXlrDownMatch() {
  return useMedia(`(max-width: ${Breakpoints.xlr - 1}px)`);
}
