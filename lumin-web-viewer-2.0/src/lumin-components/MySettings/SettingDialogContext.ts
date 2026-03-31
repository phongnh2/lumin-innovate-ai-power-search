import React from 'react';

export const SettingDialogContext = React.createContext({
  setDirty: (_isDirty: boolean) => {},
});
