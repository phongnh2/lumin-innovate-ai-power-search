import { IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import ButtonIcon from 'lumin-components/Shared/ButtonIcon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ENTITY } from 'constants/lumin-common';

import { StyledWrapper, RoleWrapper } from './index.styled';

import styles from './OrganizationTeamRole.module.scss';

const propTypes = {
  member: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};
const defaultProps = {
};

const OrganizationTeamRole = ({
  member, currentUser, onClick
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const isOwner = currentUser._id === member?.user?._id;
  const adminText = t('roleText.spaceAdmin');
  if (isEnableReskin) {
    return isOwner ? (
      <p className={styles.adminText}>{adminText}</p>
    ) : (
      <IconButton icon="trash-md" size="md" onClick={onClick} />
    );
  }
  return (
    <StyledWrapper>
      <RoleWrapper
        className={`${isOwner ? 'teamAdmin' : member.role}`}
        type={ENTITY.ORGANIZATION}
      >
        {isOwner && adminText}
      </RoleWrapper>
      {!isOwner && <ButtonIcon
        icon="trash"
        size={32}
        onClick={onClick}
      />}
    </StyledWrapper>
  );
};

OrganizationTeamRole.propTypes = propTypes;
OrganizationTeamRole.defaultProps = defaultProps;

export default OrganizationTeamRole;
