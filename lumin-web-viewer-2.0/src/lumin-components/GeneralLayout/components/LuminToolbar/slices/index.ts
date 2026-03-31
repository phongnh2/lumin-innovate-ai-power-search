import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToolbarState {
  isToolbarPopoverVisible: boolean;
  shouldOpenSignatureListPopover: boolean;
}

const initialState: ToolbarState = {
  isToolbarPopoverVisible: false,
  shouldOpenSignatureListPopover: false,
};

export const toolbarSlice = createSlice({
  name: 'TOOL_BAR',
  initialState,
  reducers: {
    setIsToolbarPopoverVisible: (
      state: ToolbarState,
      action: PayloadAction<ToolbarState['isToolbarPopoverVisible']>
    ) => {
      state.isToolbarPopoverVisible = action.payload;
    },
    setShouldOpenSignatureListPopover: (
      state: ToolbarState,
      action: PayloadAction<ToolbarState['shouldOpenSignatureListPopover']>
    ) => {
      state.shouldOpenSignatureListPopover = action.payload;
    },
    resetToolbarPopover: (state: ToolbarState) => {
      state.shouldOpenSignatureListPopover = false;
    },
  },
});

export const toolbarSelectors = {
  resetToolbarPopover: (state: { toolbar: ToolbarState }) => state.toolbar,
  isToolbarPopoverVisible: (state: { toolbar: ToolbarState }) => state.toolbar.isToolbarPopoverVisible,
  shouldOpenSignatureListPopover: (state: { toolbar: ToolbarState }) => state.toolbar.shouldOpenSignatureListPopover,
};

export const toolbarActions = toolbarSlice.actions;

export default toolbarSlice.reducer;
