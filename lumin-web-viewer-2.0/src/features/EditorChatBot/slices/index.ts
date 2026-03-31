import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FEEDBACK_TYPE } from 'features/AIChatBot/constants';
import { AI_MODE } from 'features/AIChatBot/constants/mode';
import { AttachedFileType, FeedbackType } from 'features/AIChatBot/interface';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string;
  createdAt?: Date;
}

interface FeedbackState {
  feedbackType: FeedbackType;
  negativeFeedback: {
    reason: string;
    content: string;
    isFormOpen: boolean;
  };
  isSubmitted: boolean;
  isHidden: boolean;
}

interface EditorChatBotState {
  messages: ChatMessage[];
  feedback: FeedbackState;
  chatSessionId: string;
  latestToolCalling: string;
  isAiProcessing: boolean;
  messageRestriction: string | null;
  isErrorFlag: boolean;
  latestTraceId: string;
  splitExtractPages: number[][];
  isShowSuggestPrompt: boolean;
  isFocusInput: boolean;
  chatId: string;
  isUsingPageToolsWithAI: boolean;
  mergeFiles: AttachedFileType[];
  animatedMessages: Record<string, boolean>;
  mode: string;
}

const initialState: EditorChatBotState = {
  messages: [],
  feedback: {
    feedbackType: FEEDBACK_TYPE.NONE,
    negativeFeedback: {
      reason: null,
      content: null,
      isFormOpen: false,
    },
    isSubmitted: false,
    isHidden: false,
  },
  chatSessionId: null,
  latestToolCalling: null,
  isAiProcessing: false,
  messageRestriction: null,
  isErrorFlag: false,
  latestTraceId: null,
  splitExtractPages: [],
  isShowSuggestPrompt: true,
  isFocusInput: false,
  chatId: null,
  isUsingPageToolsWithAI: false,
  mergeFiles: [],
  animatedMessages: {},
  mode: AI_MODE.ASK_MODE,
};

export const editorChatBotSlice = createSlice({
  name: 'EDITOR_CHAT_BOT',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.animatedMessages = {};
    },
    setFeedbackType: (state, action: PayloadAction<Partial<FeedbackState['feedbackType']>>) => {
      state.feedback.feedbackType = action.payload;
    },
    setNegativeFeedback: (state, action: PayloadAction<Partial<FeedbackState['negativeFeedback']>>) => {
      state.feedback.negativeFeedback = {
        ...state.feedback.negativeFeedback,
        ...action.payload,
      };
    },
    setIsSubmittedFeedback: (state, action: PayloadAction<boolean>) => {
      state.feedback.isSubmitted = action.payload;
    },
    setLatestToolCalling: (state, action: PayloadAction<string>) => {
      state.latestToolCalling = action.payload;
    },
    resetFeedbackState: (state) => {
      state.feedback = initialState.feedback;
    },
    setChatSessionId: (state, action: PayloadAction<string>) => {
      state.chatSessionId = action.payload;
    },
    setIsAiProcessing: (state, action: PayloadAction<boolean>) => {
      state.isAiProcessing = action.payload;
    },
    setMessageRestriction: (state, action: PayloadAction<string>) => {
      state.messageRestriction = action.payload;
    },
    resetEditorChatBotState: (state) => {
      state.messages = [];
      state.feedback = initialState.feedback;
      state.chatSessionId = null;
      state.latestToolCalling = null;
      state.isAiProcessing = false;
      state.messageRestriction = null;
      state.splitExtractPages = [];
      state.isErrorFlag = false;
      state.latestTraceId = null;
      state.isShowSuggestPrompt = true;
      state.isFocusInput = false;
      state.chatId = null;
      state.mergeFiles = [];
      state.animatedMessages = {};
      state.mode = AI_MODE.ASK_MODE;
    },
    setIsErrorFlag: (state, action: PayloadAction<boolean>) => {
      state.isErrorFlag = action.payload;
    },
    setLatestTraceId: (state, action: PayloadAction<string>) => {
      state.latestTraceId = action.payload;
    },
    setFeedbackHidden: (state, action: PayloadAction<boolean>) => {
      state.feedback.isHidden = action.payload;
    },
    setSplitExtractPages: (state, action: PayloadAction<number[][]>) => {
      state.splitExtractPages = action.payload;
    },
    setChatId: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
    setIsUsingPageToolsWithAI: (state, action: PayloadAction<boolean>) => {
      state.isUsingPageToolsWithAI = action.payload;
    },
    setMergeFiles: (state, action: PayloadAction<AttachedFileType[]>) => {
      state.mergeFiles = action.payload;
    },
    setMessageAnimationState: (state, action: PayloadAction<{ messageId: string; isAnimating: boolean }>) => {
      const { messageId, isAnimating } = action.payload;
      state.animatedMessages[messageId] = isAnimating;
    },
    clearAnimatedMessages: (state) => {
      state.animatedMessages = {};
    },
    setAIMode: (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    },
  },
});

export const {
  setMessages,
  clearMessages,
  setFeedbackType,
  setNegativeFeedback,
  resetFeedbackState,
  setIsSubmittedFeedback,
  setChatSessionId,
  setLatestToolCalling,
  setIsAiProcessing,
  setMessageRestriction,
  resetEditorChatBotState,
  setIsErrorFlag,
  setLatestTraceId,
  setFeedbackHidden,
  setSplitExtractPages,
  setChatId,
  setIsUsingPageToolsWithAI,
  setMergeFiles,
  setMessageAnimationState,
  clearAnimatedMessages,
  setAIMode,
} = editorChatBotSlice.actions;

export const selectors = {
  getMessages: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.messages,
  getFeedbackStates: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.feedback,
  getChatSessionId: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.chatSessionId,
  getLatestToolCalling: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.latestToolCalling,
  getIsAiProcessing: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.isAiProcessing,
  getMessageRestriction: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.messageRestriction,
  getIsErrorFlag: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.isErrorFlag,
  getLatestTraceId: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.latestTraceId,
  getSplitExtractPages: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.splitExtractPages,
  getChatId: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.chatId,
  getIsUsingPageToolsWithAI: (state: { editorChatBot: EditorChatBotState }) =>
    state.editorChatBot.isUsingPageToolsWithAI,
  getMergeFiles: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.mergeFiles,
  getAnimatedMessages: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.animatedMessages,
  getMessageAnimationState: (messageId: string) => (state: { editorChatBot: EditorChatBotState }) =>
    state.editorChatBot.animatedMessages[messageId] || false,
  getAIMode: (state: { editorChatBot: EditorChatBotState }) => state.editorChatBot.mode,
};

export default editorChatBotSlice.reducer;
