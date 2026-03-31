/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { withTranslation } from 'react-i18next';
import { ConnectedComponent, connect, useSelector } from 'react-redux';
import { AnyAction, compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch } from 'store';

import useGetUploadFolderType from 'hooks/useGetUploadFolderType';
import useGetUserOrgForUpload from 'hooks/useGetUserOrgForUpload';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { folderType } from 'constants/documentConstants';

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch,
  updateDocumentData: (type: any, documentData: unknown) => {
    switch (type) {
      case folderType.INDIVIDUAL:
        dispatch(actions.updateDocumentPersonal(documentData) as AnyAction);
        break;
      case folderType.TEAMS:
        dispatch(actions.updateDocumentTeam(documentData) as AnyAction);
        break;
      case folderType.ORGANIZATION:
        dispatch(actions.updateDocumentOrganization(documentData) as AnyAction);
        break;
      default:
    }
  },
});

const withUpdateDocumentData = (Component: React.ComponentType<unknown>) => {
  const WithUpdateDocumentData = (props: any) => {
    const currentOrganization = useGetUserOrgForUpload();
    const currentFolderType = useGetUploadFolderType();
    const currentDocument = useSelector(selectors.getCurrentDocument);
    const { isViewer } = useViewerMatch();
    return (
      <Component
        {...props}
        currentOrganization={currentOrganization}
        currentFolderType={currentFolderType}
        currentDocument={currentDocument}
        isViewer={isViewer}
      />
    );
  };

  return compose(
    connect(null, mapDispatchToProps),
    withTranslation()
  )(WithUpdateDocumentData) as ConnectedComponent<any, any>;
};

export default withUpdateDocumentData;
