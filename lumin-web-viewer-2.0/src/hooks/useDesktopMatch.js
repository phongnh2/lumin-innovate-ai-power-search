import { useMedia } from 'react-use';

import { Breakpoints } from 'constants/styles';
import { ToolbarRelatedWidth } from 'constants/toolbar';

export function useDesktopMatch() {
  return useMedia(`(min-width: ${Breakpoints.xl}px)`);
}

export function useXlrMatch() {
  return useMedia(`(min-width: ${Breakpoints.xlr}px)`);
}

export function useLargeDesktopMatch() {
  return useMedia(`(min-width: ${Breakpoints.xxl}px)`);
}

export function useResponsiveToolbarForLargeScreens() {
  return useMedia(`(min-width: ${Breakpoints.xxl + ToolbarRelatedWidth.DEFAULT_RIGHT_PANEL}px)`);
}

export function useLgMatch() {
  return useMedia(`(min-width: ${Breakpoints.lg}px)`);
}
