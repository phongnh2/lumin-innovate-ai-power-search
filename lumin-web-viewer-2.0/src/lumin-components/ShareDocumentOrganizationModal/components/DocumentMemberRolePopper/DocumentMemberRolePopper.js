import React from 'react';
import PropTypes from 'prop-types';

import MaterialPopper from 'luminComponents/MaterialPopper';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { SHARE_DOCUMENT_LIST_TYPE } from 'constants/organizationConstants';

import './DocumentMemberRolePopper.scss';
import SharePermissionPopover from 'lumin-components/ShareListItem/components/SharePermissionPopover';

const propTypes = {
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  currentDocumentRole: PropTypes.string,
  onSelected: PropTypes.func,
  listType: PropTypes.oneOf(Object.values(SHARE_DOCUMENT_LIST_TYPE)),
  handleRemoveMember: PropTypes.func,
  themeMode: PropTypes.string,
  documentRole: PropTypes.string,
};

const defaultProps = {
  anchorEl: null,
  handleClose: () => { },
  currentDocumentRole: '',
  onSelected: () => { },
  listType: SHARE_DOCUMENT_LIST_TYPE.MEMBER,
  handleRemoveMember: () => {},
  themeMode: 'light',
  documentRole: '',
};

const DocumentMemberRolePopper = (props) => {
  const {
    anchorEl, handleClose, currentDocumentRole, onSelected, listType,
    handleRemoveMember, themeMode, documentRole,
  } = props;
  const documentRoleOfMember = (currentDocumentRole || DOCUMENT_ROLES.SHARER).toLowerCase();

  return (
    <MaterialPopper
      open
      anchorEl={anchorEl}
      handleClose={handleClose}
      placement="bottom-end"
      parentOverflow="viewport"
      classes={`theme-${themeMode}`}
    >
      <SharePermissionPopover
        value={documentRoleOfMember}
        canDelete={
          listType === SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL && DOCUMENT_ROLES.SHARER === documentRole.toUpperCase()
        }
        closePopper={handleClose}
        handleChangePermission={(role) => onSelected(role.toUpperCase())}
        handleRemoveMember={handleRemoveMember}
      />
    </MaterialPopper>
  );
};

DocumentMemberRolePopper.propTypes = propTypes;
DocumentMemberRolePopper.defaultProps = defaultProps;

export default DocumentMemberRolePopper;
