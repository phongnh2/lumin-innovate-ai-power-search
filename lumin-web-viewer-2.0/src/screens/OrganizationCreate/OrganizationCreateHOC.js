import React from 'react';
import { useTabletMatch } from 'hooks';

const withOrganizationCreate = (WrappedComponent) => (props) => {
  const isTabletMatch = useTabletMatch();
  return (
    <WrappedComponent isTabletMatch={isTabletMatch} {...props} />
  );
};

export default withOrganizationCreate;
