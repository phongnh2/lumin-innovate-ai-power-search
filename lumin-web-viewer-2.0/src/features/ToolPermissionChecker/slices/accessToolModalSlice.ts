import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppFeaturesType } from 'features/FeatureConfigs/featureStoragePolicies';

import { PremiumToolsPopOverEventType } from 'constants/premiumToolsPopOverEvent';
import { IToolName } from 'constants/toolsName';

interface AccessToolModalState {
  openedModal: boolean;
  toolName?: IToolName;
  eventName?: PremiumToolsPopOverEventType;
  featureName?: AppFeaturesType;
}

const initialState: AccessToolModalState = {
  openedModal: false,
};

export const accessToolModalSlice = createSlice({
  name: 'ACCESS_TOOL_MODAL',
  initialState,
  reducers: {
    closeModal: (state) => {
      state.openedModal = false;
      state.toolName = undefined;
      state.featureName = undefined;
      state.eventName = undefined;
    },
    openModal: (state, action: PayloadAction<Pick<AccessToolModalState, 'toolName' | 'featureName' | 'eventName'>>) => {
      state.openedModal = true;
      state.toolName = action.payload.toolName;
      state.featureName = action.payload.featureName;
      state.eventName = action.payload.eventName;
    },
  },
});

export const accessToolModalSelectors = {
  openedModal: (state: { accessToolModal: AccessToolModalState }) => state.accessToolModal.openedModal,
  targetTool: (state: { accessToolModal: AccessToolModalState }) => ({
    toolName: state.accessToolModal.toolName,
    featureName: state.accessToolModal.featureName,
    eventName: state.accessToolModal.eventName,
  }),
};

export const accessToolModalActions = accessToolModalSlice.actions;

export default accessToolModalSlice.reducer;
