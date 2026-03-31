import React from 'react';

import ChatBotDisclaimer from '../ChatBotDisclaimer';
import ChatBotFeedback from '../ChatBotFeedback';
import ChatBotHeader from '../ChatBotHeader';
import ChatBotIcon from '../ChatBotIcon';
import AssistantMessage from '../ChatBotMessages/AssistantMessage';
import ChatBotMessages from '../ChatBotMessages/ChatBotMessages';
import SharedAssistantMessageLayout from '../ChatBotMessages/SharedAssistantMessageLayout';
import UserMessage from '../ChatBotMessages/UserMessage';
import ChatBotReferenceFile from '../ChatBotReferenceFile';
import ChatBotReferenceSources from '../ChatBotReferenceSources';
import ChatBotWelcome from '../ChatBotWelcome';
import PromptInput from '../PromptInput';
import WarningRefresh from '../WarningRefresh/WarningRefresh';

import styles from './ChatBot.module.scss';

const ChatBot: React.FC<{ children?: React.ReactNode }> & {
  Content: typeof ChatBotContent;
  Disclaimer: typeof ChatBotDisclaimer;
  Header: typeof ChatBotHeader;
  Welcome: typeof ChatBotWelcome;
  Input: typeof PromptInput;
  MessageContainer: typeof ChatBotMessages;
  UserMessage: typeof UserMessage;
  AssistantMessage: typeof AssistantMessage;
  SharedAssistantMessageLayout: typeof SharedAssistantMessageLayout;
  Feedback: typeof ChatBotFeedback;
  Icon: typeof ChatBotIcon;
  ReferenceSources: typeof ChatBotReferenceSources;
  WarningPopup: typeof WarningRefresh;
  ReferenceFiles: typeof ChatBotReferenceFile;
} = ({ children }) => <div className={styles.container}>{children}</div>;

export const ChatBotContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className={styles.content}>{children}</div>
);

ChatBot.Content = ChatBotContent;
ChatBot.Disclaimer = ChatBotDisclaimer;
ChatBot.Header = ChatBotHeader;
ChatBot.Welcome = ChatBotWelcome;
ChatBot.Input = PromptInput;
ChatBot.MessageContainer = ChatBotMessages;
ChatBot.UserMessage = UserMessage;
ChatBot.AssistantMessage = AssistantMessage;
ChatBot.SharedAssistantMessageLayout = SharedAssistantMessageLayout;
ChatBot.Feedback = ChatBotFeedback;
ChatBot.Icon = ChatBotIcon;
ChatBot.ReferenceSources = ChatBotReferenceSources;
ChatBot.WarningPopup = WarningRefresh;
ChatBot.ReferenceFiles = ChatBotReferenceFile;

export default ChatBot;
