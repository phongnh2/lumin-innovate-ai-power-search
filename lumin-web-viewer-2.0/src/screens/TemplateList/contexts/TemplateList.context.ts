import { createContext } from 'react';

export type TemplateListContextType = {
  scrollRef: React.RefObject<HTMLElement | null>;
};

export const TemplateListScreenContext = createContext<TemplateListContextType>({
  scrollRef: { current: null },
});
