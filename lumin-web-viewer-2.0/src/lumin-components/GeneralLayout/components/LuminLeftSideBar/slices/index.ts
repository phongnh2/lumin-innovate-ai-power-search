import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LeftSideBarState {
  hoveredNavigationTabs: string[];
  isLeftSidebarPopoverOpened: boolean;
}

const initialState: LeftSideBarState = {
  hoveredNavigationTabs: [],
  isLeftSidebarPopoverOpened: false,
};

export const leftSideBarSlice = createSlice({
  name: 'LEFT_SIDE_BAR',
  initialState,
  reducers: {
    setHoveredNavigationTabs: (state: LeftSideBarState, action: PayloadAction<string>) => {
      const { payload } = action;
      if (!payload) {
        state.hoveredNavigationTabs = [];
        return;
      }
      state.hoveredNavigationTabs = [payload, ...state.hoveredNavigationTabs.filter((item) => item !== payload)];
    },
    setIsLeftSidebarPopoverOpened: (
      state: LeftSideBarState,
      action: PayloadAction<LeftSideBarState['isLeftSidebarPopoverOpened']>
    ) => {
      state.isLeftSidebarPopoverOpened = action.payload;
    },
  },
});

export const leftSideBarSelectors = {
  hoveredNavigationTabs: (state: { leftSideBar: LeftSideBarState }) => state.leftSideBar.hoveredNavigationTabs,
  isLeftSidebarPopoverOpened: (state: { leftSideBar: LeftSideBarState }) =>
    state.leftSideBar.isLeftSidebarPopoverOpened,
};

export const leftSideBarActions = leftSideBarSlice.actions;

export default leftSideBarSlice.reducer;
