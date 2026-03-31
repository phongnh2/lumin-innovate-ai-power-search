import { useMedia } from 'react-use';

import { Breakpoints } from 'constants/styles/Breakpoints';

import { useChatbotStore } from './useChatbotStore';

export function useXLtoXLRMatch() {
  return useMedia(`(min-width: ${Breakpoints.xl}px) and (max-width: ${Breakpoints.xlr - 1}px)`);
}

export function useLgDownMatch() {
  return useMedia(`(max-width: ${Breakpoints.lg - 1}px)`);
}

export const useBulkActionIconButton = () => {
  const { isVisible } = useChatbotStore();
  const isXLtoXLRMatch = useXLtoXLRMatch();
  const isLgDownMatch = useLgDownMatch();

  return isVisible && (isXLtoXLRMatch || isLgDownMatch);
};
