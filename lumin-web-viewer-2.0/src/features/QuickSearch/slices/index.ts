import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuickSearchState {
  isOpenQuickSearch: boolean;
  searchResults: {
    searchKeyword: string | null;
    matchedTools: string[];
  };
}

const initialState: QuickSearchState = {
  isOpenQuickSearch: false,
  searchResults: {
    searchKeyword: null,
    matchedTools: [],
  },
};

export const quickSearchSlice = createSlice({
  name: 'QUICK_SEARCH',
  initialState,
  reducers: {
    setIsOpenQuickSearch: (state, action: PayloadAction<boolean>) => {
      state.isOpenQuickSearch = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<{ searchKeyword: string; matchedTools: string[] }>) => {
      state.searchResults = action.payload;
    },
    resetQuickSearchResults: (state) => {
      state.searchResults = {
        searchKeyword: null,
        matchedTools: [],
      };
    },
  },
});

export const { setIsOpenQuickSearch, setSearchResults, resetQuickSearchResults } = quickSearchSlice.actions;

export const quickSearchSelectors = {
  isOpenQuickSearch: (state: { quickSearch: QuickSearchState }) => state.quickSearch.isOpenQuickSearch,
  searchResults: (state: { quickSearch: QuickSearchState }) => state.quickSearch.searchResults,
};

export default quickSearchSlice.reducer;
