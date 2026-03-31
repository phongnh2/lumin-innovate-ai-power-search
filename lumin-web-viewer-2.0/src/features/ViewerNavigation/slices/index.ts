import { createSlice } from '@reduxjs/toolkit';

import { ViewerNavigationState } from '../interfaces';

export const viewerNavigationSlice = createSlice({
  name: 'VIEWER_NAVIGATION',
  initialState: {
    isExpanded: false,
  } as ViewerNavigationState,
  reducers: {
    toggleViewerNavigation: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    closeViewerNavigation: (state) => {
      state.isExpanded = false;
    },
  },
});

export const viewerNavigationSelectors = {
  isExpanded: (state: { viewerNavigation: ViewerNavigationState }) => state.viewerNavigation.isExpanded,
};

export const { toggleViewerNavigation, closeViewerNavigation } = viewerNavigationSlice.actions;

export default viewerNavigationSlice.reducer;
