import localStorageManager from 'helpers/localStorageManager';

import defaultToolStylesMap from 'constants/defaultToolStylesMap';

export const getToolStyles = (toolName: keyof typeof defaultToolStylesMap) => {
  let toolStyles = null;
  try {
    toolStyles = localStorage.getItem(`toolData-${toolName}`);
  } catch {
    console.warn(`Disabling "localStorage" because it could not be accessed.`);
    localStorageManager.disableLocalStorage();
  }

  if (!toolStyles && defaultToolStylesMap[toolName]) {
    toolStyles = JSON.stringify(defaultToolStylesMap[toolName]);
  }

  return toolStyles;
};
