import { createContext } from "react";

import { ChatBotContextType } from "../interface";

export const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);