import { createContext } from 'react';

import { StateType, ActionType } from '../reducers';

interface SearchResultContextType {
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}

export const SearchResultContext = createContext<SearchResultContextType | undefined>(undefined);
