import React from 'react';
import Helmet from 'react-helmet';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetMetaTitle, useTranslation } from 'hooks';

const withOrganizationTitle = (page) => (WrappedComponent) => (props) => {
  const { t } = useTranslation();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { name } = currentOrganization.data || {};
  const { getMetaTitle } = useGetMetaTitle();

  return (
    <>
      {!currentOrganization.loading && name && (
        <Helmet>
          <title>{getMetaTitle(`${t(page)} | ${name}`)}</title>
        </Helmet>
      )}
      <WrappedComponent {...props} />
    </>
  );
};

export default withOrganizationTitle;
