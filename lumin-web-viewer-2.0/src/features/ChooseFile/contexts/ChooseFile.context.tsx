import { createContext } from 'react';

import { StateType, Action } from '../reducers/ChooseFile.reducer';

interface ChooseFileContextType {
  state: StateType;
  dispatch: React.Dispatch<Action>;
}

export const ChooseFileContext = createContext<ChooseFileContextType | undefined>(undefined);
