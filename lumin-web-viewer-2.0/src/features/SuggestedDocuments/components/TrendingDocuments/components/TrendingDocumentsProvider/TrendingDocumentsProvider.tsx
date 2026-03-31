import React, { useReducer, useMemo } from 'react';

import { TrendingDocumentsContext } from 'features/SuggestedDocuments/contexts/TrendingDocuments.context';
import { initialState, trendingDocumentsReducer } from 'features/SuggestedDocuments/reducers/TrendingDocuments.reducer';

interface TrendingDocumentsProviderProps {
  children: React.ReactNode;
}

const TrendingDocumentsProvider = ({ children }: TrendingDocumentsProviderProps) => {
  const [state, dispatch] = useReducer(trendingDocumentsReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <TrendingDocumentsContext.Provider value={contextValue}>{children}</TrendingDocumentsContext.Provider>;
};

export default TrendingDocumentsProvider;
