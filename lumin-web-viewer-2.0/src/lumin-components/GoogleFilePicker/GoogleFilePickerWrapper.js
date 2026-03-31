import React from 'react';

import { useHandlePickThirdPartyFile } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import GoogleFilePicker from './GoogleFilePicker';

const GoogleFilePickerWrapper = (props) => {
  const { handlePickThirdPartyFile } = useHandlePickThirdPartyFile();
  const { onKeyDown } = useKeyboardAccessibility();

  return <GoogleFilePicker handlePickThirdPartyFile={handlePickThirdPartyFile} onPickKeyDown={onKeyDown} {...props} />;
};

export default GoogleFilePickerWrapper;
