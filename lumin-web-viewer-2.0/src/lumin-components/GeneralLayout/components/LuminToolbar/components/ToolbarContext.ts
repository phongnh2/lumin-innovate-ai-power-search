import { createContext, useContext } from 'react';

export const ToolbarProviderContext = createContext({ collapsedItem: 0, toolName: '' });

export const useToolbarContext = () => useContext(ToolbarProviderContext);
