import { createSlice } from '@reduxjs/toolkit';

interface ChatbotFeedbackModalState {
  isOpenFeedbackModal: boolean;
}

const initialState: ChatbotFeedbackModalState = {
  isOpenFeedbackModal: false,
};

const chatbotFeedbackModalSlice = createSlice({
  name: 'CHATBOT_FEEDBACK_MODAL',
  initialState,
  reducers: {
    openFeedbackModal: (state) => {
      state.isOpenFeedbackModal = true;
    },
    closeFeedbackModal: (state) => {
      state.isOpenFeedbackModal = false;
    },
  },
});

export const { openFeedbackModal, closeFeedbackModal } = chatbotFeedbackModalSlice.actions;

export const feedbackModalSelectors = {
  isOpenFeedbackModal: (state: { chatbotFeedbackModal: ChatbotFeedbackModalState }) =>
    state.chatbotFeedbackModal.isOpenFeedbackModal,
};

export default chatbotFeedbackModalSlice.reducer;
