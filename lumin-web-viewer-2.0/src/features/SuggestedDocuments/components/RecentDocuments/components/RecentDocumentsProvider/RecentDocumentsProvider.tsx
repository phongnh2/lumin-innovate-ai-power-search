import React, { useReducer, useMemo } from 'react';

import { RecentDocumentsContext } from 'features/SuggestedDocuments/contexts/RecentDocuments.context';
import { initialState, recentDocumentsReducer } from 'features/SuggestedDocuments/reducers/RecentDocument.reducer';

interface RecentDocumentsProviderProps {
  children: React.ReactNode;
}

const RecentDocumentsProvider = ({ children }: RecentDocumentsProviderProps) => {
  const [state, dispatch] = useReducer(recentDocumentsReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <RecentDocumentsContext.Provider value={contextValue}>{children}</RecentDocumentsContext.Provider>;
};

export default RecentDocumentsProvider;
