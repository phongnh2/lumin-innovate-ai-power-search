import { createContext } from 'react';

export type HomeContextType = {
  scrollRef: HTMLElement | null;
};

export const HomeContext = createContext<HomeContextType>({
  scrollRef: null,
});
