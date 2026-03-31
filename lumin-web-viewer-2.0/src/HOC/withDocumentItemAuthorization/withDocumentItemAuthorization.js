import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { getDocAuthorizationHOF } from 'utils';

import { DocumentActions } from 'constants/documentConstants';

function withDocumentItemAuthorization(WrappedComponent) {
  class HOC extends React.PureComponent {
    getWithAuthorize = () => {
      const { document, organizations, teams, currentUser } = this.props;
      const { data: orgData } = organizations;

      return getDocAuthorizationHOF({
        document,
        teams,
        orgData,
        currentUser,
      });
    };

    checkCapabilitiesDocumentPermission = (action) => {
      if (action === DocumentActions.MakeACopy) {
        return this.props.document.capabilities?.canCopy;
      }
      return true;
    };

    render() {
      const withAuthorize = this.getWithAuthorize();
      const { checkCapabilitiesDocumentPermission } = this;
      return (
        <WrappedComponent
          {...this.props}
          withAuthorize={withAuthorize}
          checkCapabilitiesDocumentPermission={checkCapabilitiesDocumentPermission}
        />
      );
    }
  }

  HOC.propTypes = {
    document: PropTypes.object.isRequired,
    organizations: PropTypes.object,
    teams: PropTypes.array,
    currentUser: PropTypes.object,
  };

  HOC.defaultProps = {
    organizations: {},
    teams: [],
    currentUser: {},
  };

  const mapStateToProps = (state) => ({
    organizations: selectors.getOrganizationList(state),
    teams: selectors.getTeams(state),
    currentUser: selectors.getCurrentUser(state),
  });

  return connect(mapStateToProps)(HOC);
}

export default withDocumentItemAuthorization;
