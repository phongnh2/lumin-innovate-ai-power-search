import React from 'react';

import withRedirectWorkspace from 'HOC/withRedirectWorkspace';

import DocumentFolder from '../DocumentFolder';

function PersonalDocumentFolder(props) {
  return <DocumentFolder {...props} />;
}

export default withRedirectWorkspace(PersonalDocumentFolder);
