import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { useGetMetaTitle, useTranslation } from 'hooks';

const withDashboardWindowTitle = (WrappedComponent, tabName = 'common.insights') => {
  function HOC(props) {
    const { t } = useTranslation();
    const { getMetaTitle } = useGetMetaTitle();

    const {
      currentOrganization,
    } = props;

    const { name, url } = currentOrganization.data;

    const organizationName = name || url;

    return (
      <>
        <Helmet>
          <title>{getMetaTitle(`${t(tabName)} | ${t('common.dashboard')} | ${organizationName}`)}</title>
        </Helmet>
        <WrappedComponent {...props} />
      </>
    );
  }

  HOC.propTypes = {
    currentOrganization: PropTypes.object.isRequired,
  };

  const mapStateToProps = (state) => ({
    currentOrganization: selectors.getCurrentOrganization(state),
  });

  return connect(mapStateToProps)(HOC);
};

export default withDashboardWindowTitle;
