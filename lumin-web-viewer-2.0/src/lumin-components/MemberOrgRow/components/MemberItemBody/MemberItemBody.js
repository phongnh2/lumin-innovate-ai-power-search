import { Avatar } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import DefaultUserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import MaterialAvatar from 'luminComponents/MaterialAvatar';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import avatarUtils from 'utils/avatar';

import { ORGANIZATION_ROLE_TEXT, ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';

import * as Styled from '../../MemberOrgRow.styled';

import styles from './MemberItemBody.module.scss';

const MemberItemBody = ({ listToShow, member, currentUserId, isReskin }) => {
  const { t } = useTranslation();

  const { _id: memberId, name, email, role, avatarRemoteId } = member;

  const currentUserLabel = useMemo(() => {
    const hasJoinedOrg = [
      ORGANIZATION_MEMBER_TYPE.MEMBER,
      ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER,
      ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST,
    ].includes(listToShow);
    if (memberId === currentUserId && hasJoinedOrg) {
      return isReskin ? t('common.you') : <Styled.CurrentUserLabel>({t('common.you')})</Styled.CurrentUserLabel>;
    }
    return null;
  }, [currentUserId, listToShow, memberId, isReskin, t]);

  if (isReskin) {
    return (
      <div className={styles.container}>
        <Avatar
          size="sm"
          variant="outline"
          src={name ? avatarUtils.getAvatar(avatarRemoteId) : DefaultUserAvatar}
          name={name}
          alt={name || 'User avatar'}
        />
        <div className={styles.memberInfo}>
          <p className={styles.name}>
            {name || <span>{t('modalShare.pendingUser')}</span>}
            {typeof currentUserLabel === 'string' ? ` (${currentUserLabel})` : ''}
          </p>
          <span className={styles.email}>{email}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {name ? (
        <MaterialAvatar hasBorder src={avatarUtils.getAvatar(avatarRemoteId)} size={40}>
          {avatarUtils.getTextAvatar(name)}
        </MaterialAvatar>
      ) : (
        <SvgElement content="invited-user" alt="Invited user" width={40} height={40} />
      )}
      <Styled.IdentityWrapper>
        <Styled.Identity>
          <span>{name || <Styled.PendingText>{t('modalShare.pendingUser')}</Styled.PendingText>} </span>
          {currentUserLabel}
        </Styled.Identity>
        <Styled.Email $hideInMobile>{email}</Styled.Email>
        <Styled.Role $role={role.toUpperCase()} $hideInTabletUp>
          {t(ORGANIZATION_ROLE_TEXT[member.role.toUpperCase()])}
        </Styled.Role>
        <Styled.Email $hideInTabletUp>{email} </Styled.Email>
      </Styled.IdentityWrapper>
    </>
  );
};
MemberItemBody.propTypes = {
  listToShow: PropTypes.string.isRequired,
  member: PropTypes.object.isRequired,
  currentUserId: PropTypes.string.isRequired,
  isReskin: PropTypes.bool,
};

MemberItemBody.defaultProps = {
  isReskin: false,
};

export default MemberItemBody;
