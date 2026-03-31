import { createContext } from 'react';

import { StateType, ActionType } from '../reducers/TrendingDocuments.reducer';

interface TrendingDocumentsContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

export const TrendingDocumentsContext = createContext<TrendingDocumentsContextType | undefined>(undefined);
