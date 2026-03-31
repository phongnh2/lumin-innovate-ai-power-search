import React, { Dispatch, SetStateAction } from 'react';

type ContextType = {
  newOrganization: { name: string; error: string };
  setNewOrganization: Dispatch<SetStateAction<{ name: string; error: string }>>;
  getNewSecret: () => void;
  hasClientSecret: boolean;
};

export const FreeTrialBoardContext = React.createContext<ContextType>({} as ContextType);
