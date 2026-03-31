import React, { createContext, useReducer, ReactNode, Dispatch, useMemo } from 'react';

import { templateListReducer, initialState, TemplateListAction } from '../reducers/TemplateList.reducer';
import { TemplateListState } from '../types/templateList';

type TemplateListContextType = {
  state: TemplateListState;
  dispatch: Dispatch<TemplateListAction>;
};

export const TemplateListContext = createContext<TemplateListContextType>({
  state: initialState,
  dispatch: () => null,
});

type TemplateListProviderProps = {
  children: ReactNode;
};

export const TemplateListProvider: React.FC<TemplateListProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(templateListReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TemplateListContext.Provider value={contextValue}>{children}</TemplateListContext.Provider>;
};
