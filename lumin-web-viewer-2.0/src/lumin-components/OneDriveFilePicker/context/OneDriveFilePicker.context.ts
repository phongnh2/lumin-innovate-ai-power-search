import { createContext } from 'react';

export const OneDriveFilePickerContext = createContext(
  {} as {
    openPickerIframe: () => void;
    closePickerIframe: () => void;
    iframeRef: React.MutableRefObject<HTMLIFrameElement>;
  }
);
