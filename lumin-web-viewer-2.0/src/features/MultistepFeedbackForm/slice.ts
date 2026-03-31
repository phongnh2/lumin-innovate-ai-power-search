import { createSlice } from '@reduxjs/toolkit';

import { RootState } from 'store';

type FeedbackFormState = {
  isEnabled: boolean;
};

const initialState = <FeedbackFormState>{
  isEnabled: false,
};

export const feedbackFormSlice = createSlice({
  name: 'FEEDBACK_FORM',
  initialState,
  reducers: {
    openFeedbackForm: (state) => {
      state.isEnabled = true;
    },
    closeFeedbackForm: (state) => {
      state.isEnabled = false;
    },
  },
});

export const feedbackFormSelector = {
  isEnabled: (state: RootState) => state.feedbackForm.isEnabled,
};

export const { openFeedbackForm, closeFeedbackForm } = feedbackFormSlice.actions;

export default feedbackFormSlice.reducer;
