import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { StyledItemWrapper } from '../SearchResultItem.styled';

const UserInfoWrapper = ({ unallowed, children, disabled }) => {
  const { t } = useTranslation();

  if (unallowed) {
    return (
      <Tooltip title={t('modalShare.cannotShareDocumentWithUser')}>
        <StyledItemWrapper disabled={disabled}>{children}</StyledItemWrapper>
      </Tooltip>
    );
  }

  return <StyledItemWrapper disabled={disabled}>{children}</StyledItemWrapper>;
};

UserInfoWrapper.propTypes = {
  unallowed: PropTypes.bool,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};

UserInfoWrapper.defaultProps = {
  unallowed: false,
  disabled: false,
};

export default UserInfoWrapper;
