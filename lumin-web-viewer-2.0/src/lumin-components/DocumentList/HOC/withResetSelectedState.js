import React, { useEffect, useContext } from 'react';

import { useDesktopMatch, useDocumentClientId, useGetFolderType } from 'hooks';

import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { DocumentListRendererContext } from '../Context';

const withResetSelectedState = (WrappedComponent) => (props) => {
  const { setRemoveDocList, setRemoveFolderList, setSelectDocMode } = useContext(DocumentListRendererContext);

  const isDesktopUp = useDesktopMatch();
  const currentFolderType = useGetFolderType();
  const { clientId } = useDocumentClientId();

  useEffect(() => {
    setRemoveFolderList?.({ type: CHECKBOX_TYPE.DELETE });
    setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
    setSelectDocMode(false);
  }, [isDesktopUp, currentFolderType, clientId]);

  return <WrappedComponent {...props} />;
};

export default withResetSelectedState;
