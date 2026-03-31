import { useMediaQuery } from 'react-responsive';

export const useSmall = () => {
  return useMediaQuery({ maxWidth: 767 });
};

export const useMedium = () => {
  return useMediaQuery({ minWidth: 768, maxWidth: 1023 });
};

export const useLarge = () => {
  return useMediaQuery({ minWidth: 1024 });
};
