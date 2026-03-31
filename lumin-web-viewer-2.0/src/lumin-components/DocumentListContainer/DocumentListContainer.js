import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import { DocumentSearchContext } from 'lumin-components/Document/context';
import DocumentList from 'luminComponents/DocumentList';

const propTypes = {
  documentList: PropTypes.array,
  documentLoading: PropTypes.bool,
  folderLoading: PropTypes.bool,
  hasNextPage: PropTypes.bool,
  fetchMore: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  total: PropTypes.number,
  folders: PropTypes.array,
};

const defaultProps = {
  documentList: [],
  documentLoading: true,
  folderLoading: true,
  hasNextPage: false,
  total: null,
  folders: [],
};

function DocumentListContainer(props) {
  const { documentList, hasNextPage, fetchMore, documentLoading, folderLoading, refetch, total, folders } = props;

  const { searchKey } = useContext(DocumentSearchContext);

  return (
    <DocumentList
      documentLoading={documentLoading}
      folderLoading={folderLoading}
      documents={documentList}
      hasNextPage={hasNextPage}
      fetchMore={fetchMore}
      refetchDocument={refetch}
      searchKey={searchKey}
      total={total}
      folders={folders}
    />
  );
}

DocumentListContainer.propTypes = propTypes;
DocumentListContainer.defaultProps = defaultProps;

export default React.memo(DocumentListContainer);
