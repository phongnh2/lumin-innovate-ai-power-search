import React, { useReducer, useMemo } from 'react';

import { SearchResultContext } from 'features/HomeSearch/contexts';
import { initialState, searchResultReducer } from 'features/HomeSearch/reducers';

interface SearchResultProviderProps {
  children: React.ReactNode;
}

const SearchResultProvider = ({ children }: SearchResultProviderProps) => {
  const [state, dispatch] = useReducer(searchResultReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <SearchResultContext.Provider value={contextValue}>{children}</SearchResultContext.Provider>;
};

export default SearchResultProvider;
