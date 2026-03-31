import React from 'react';
import PropTypes from 'prop-types';
import DeleteOrgWarning from '../DeleteOrgWarning';
import DeleteUserWarning from '../DeleteUserWarning';

function DeleteResourceWarning({
  currentOrganization,
  currentUser,
  canShowDeleteAccount,
  canShowDeleteOrg,
}) {
  if (canShowDeleteOrg) {
    return (
      <DeleteOrgWarning
        deletedAt={currentOrganization.deletedAt}
        orgId={currentOrganization._id}
        userRole={currentOrganization.userRole}
      />
    );
  }
  if (canShowDeleteAccount) {
    return (
      <DeleteUserWarning
        deletedAt={currentUser.deletedAt}
      />
    );
  }
  return null;
}

DeleteResourceWarning.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  canShowDeleteAccount: PropTypes.bool.isRequired,
  canShowDeleteOrg: PropTypes.bool.isRequired,
};
DeleteResourceWarning.defaultProps = {};

export default DeleteResourceWarning;
