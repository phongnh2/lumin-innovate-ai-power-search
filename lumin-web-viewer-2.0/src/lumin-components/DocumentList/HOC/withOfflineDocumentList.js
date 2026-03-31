import React from 'react';
import { OfflineDocumentIntercept } from 'HOC/OfflineStorageHOC';

const withOfflineDocumentList = (Component) => (props) => (
  <OfflineDocumentIntercept {...props}>
    {(newProps) => {
      return <Component {...newProps} />;
    }}
  </OfflineDocumentIntercept>
);

export default withOfflineDocumentList;
