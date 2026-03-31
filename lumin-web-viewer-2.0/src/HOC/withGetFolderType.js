import React from 'react';

import { useGetFolderType } from 'hooks';

const withGetFolderType = (Component) => (props) => {
  const currentFolderType = useGetFolderType();
  return <Component {...props} currentFolderType={currentFolderType} />;
};

withGetFolderType.propTypes = {

};

export default withGetFolderType;
