import { useMedia } from 'react-use';

import { Breakpoints } from 'constants/styles';

export function useMobileMatch() {
  return useMedia(`(max-width: ${Breakpoints.md - 0.02}px)`);
}

export function useExtraSmallMatch() {
  return useMedia(`(max-width: ${Breakpoints.xs - 0.02}px)`);
}
