import React, { useState, useMemo, useRef } from 'react';

import { OneDriveFilePickerIframe } from './components';
import { OneDriveFilePickerContext } from './context';

type OneDriveFilePickerProviderProps = {
  children: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
};

const OneDriveFilePickerProvider = (props: OneDriveFilePickerProviderProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [isOpenPickerIframe, setIsOpenPickerIframe] = useState(false);

  const openPickerIframe = () => setIsOpenPickerIframe(true);

  const closePickerIframe = () => setIsOpenPickerIframe(false);

  const values = useMemo(
    () => ({
      openPickerIframe,
      closePickerIframe,
      iframeRef,
    }),
    []
  );

  return (
    <OneDriveFilePickerContext.Provider value={values}>
      {props.children}
      <OneDriveFilePickerIframe ref={iframeRef} isOpen={isOpenPickerIframe} />
    </OneDriveFilePickerContext.Provider>
  );
};

export default OneDriveFilePickerProvider;
