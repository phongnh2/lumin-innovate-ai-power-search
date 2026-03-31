import { createContext } from 'react';

import { StateType, ActionType } from '../reducers/RecentDocument.reducer';

interface RecentDocumentsContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

export const RecentDocumentsContext = createContext<RecentDocumentsContextType | undefined>(undefined);
