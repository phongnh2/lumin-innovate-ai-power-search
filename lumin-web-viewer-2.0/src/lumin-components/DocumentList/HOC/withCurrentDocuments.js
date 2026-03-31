import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { useFolderPathMatch, useGetCurrentTeam, useGetFolderType } from 'hooks';
import selectors from 'selectors';
import { documentServices } from 'services';
import { folderType } from 'constants/documentConstants';

const withCurrentDocuments = (WrappedComponent) => {
  const HOC = (props) => {
    const { documents } = props;
    const currentFolderType = useGetFolderType();
    const currentTeam = useGetCurrentTeam();
    const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
    const isOffline = useSelector(selectors.isOffline);
    const isInFolderPage = useFolderPathMatch();
    let currentDocuments;

    if (isInFolderPage || isOffline || currentFolderType === folderType.DEVICE) {
      currentDocuments = documents;
    } else {
      // Get document from redux if documents are stored outside of folder
      const { documents: currentDocList } = documentServices.getCurrentDocumentList(
        currentFolderType,
        { teamId: currentTeam._id, orgId: currentOrganization._id },
      );
      currentDocuments = currentDocList;
    }

    return (
      <WrappedComponent {...props} documents={currentDocuments} />
    );
  };

  HOC.propTypes = {
    documents: PropTypes.arrayOf(PropTypes.object),
  };

  HOC.defaultProps = {
    documents: [],
  };

  return HOC;
};

export default withCurrentDocuments;
