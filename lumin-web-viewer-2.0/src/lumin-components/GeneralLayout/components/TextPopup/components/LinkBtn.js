import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import PopupLinkBtn from 'lumin-components/GeneralLayout/components/PopupLinkBtn';

import getCurrentRole from 'helpers/getCurrentRole';

import { DOCUMENT_ROLES } from 'constants/lumin-common';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const LinkBtn = ({ currentDocument }) => {
  const { isDisabledLink } = useTextPopupConditions();
  const userRole = getCurrentRole(currentDocument);

  return !isDisabledLink && [DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.EDITOR].includes(userRole) ? (
    <PopupLinkBtn />
  ) : null;
};

LinkBtn.propTypes = {
  currentDocument: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  currentDocument: selectors.getCurrentDocument(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LinkBtn);
