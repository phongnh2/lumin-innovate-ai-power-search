import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string;
  createdAt?: Date;
}

interface WebChatBotState {
  messages: ChatMessage[];
  chatSessionId: string;
}

const initialState: WebChatBotState = {
  messages: [],
  chatSessionId: '',
};

export const webChatBotSlice = createSlice({
  name: 'WEB_CHAT_BOT',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setChatSessionId: (state, action: PayloadAction<string>) => {
      state.chatSessionId = action.payload;
    },
  },
});

export const { setMessages, clearMessages, setChatSessionId } = webChatBotSlice.actions;

export const selectors = {
  getMessages: (state: { webChatBot: WebChatBotState }) => state.webChatBot.messages,
  getChatSessionId: (state: { webChatBot: WebChatBotState }) => state.webChatBot.chatSessionId,
};

export default webChatBotSlice.reducer;
