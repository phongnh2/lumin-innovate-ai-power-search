/* eslint-disable react/prop-types */
import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';

import ContextMenu from 'luminComponents/ContextMenu';
import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

import { useHomeMatch } from 'hooks';

import { DocumentViewerOpenFrom } from 'utils/Factory/EventCollection/constants/DocumentEvent';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const withRightClickDocument = (WrappedComponent) => (props) => {
  const { document: selectedDocument, uploading } = props;
  const navigate = useNavigate();
  const { setCookieModalVisible, cookiesDisabled } = useContext(CookieWarningContext);
  const { externalDocumentExistenceGuard } = useContext(DocumentListContext) || {};

  const { isHomePage } = useHomeMatch();

  const openFrom = useMemo(
    () => (isHomePage ? DocumentViewerOpenFrom.HOMEPAGE : DocumentViewerOpenFrom.DOC_LIST),
    [isHomePage]
  );

  const openInCurrentTab = () => {
    if (cookiesDisabled && featureStoragePolicy.externalStorages.includes(selectedDocument.service)) {
      setCookieModalVisible(true);
    } else {
      externalDocumentExistenceGuard(selectedDocument, () =>
        navigate(`${Routers.VIEWER}/${selectedDocument._id}`, {
          state: {
            folderName: selectedDocument.folderData?.name,
            openFrom,
          },
        })
      );
    }
  };

  const openInNewTab = () => {
    externalDocumentExistenceGuard(selectedDocument, () =>
      window.open(`${Routers.VIEWER}/${selectedDocument._id}?${UrlSearchParam.OPEN_FROM}=${openFrom}`, '_blank')
    );
  };

  if (uploading) {
    return <WrappedComponent {...props} />;
  }

  return (
    <ContextMenu id={selectedDocument._id} openInNewTab={openInNewTab} openInCurrentTab={openInCurrentTab}>
      <WrappedComponent {...props} />
    </ContextMenu>
  );
};

export default withRightClickDocument;
