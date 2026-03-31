import { useDisclosure } from '@mantine/hooks';
import { Menu, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import ViewerContext, { OnlineMember } from 'screens/Viewer/Context';

import { removeDuplicateMember } from 'lumin-components/HeaderLumin/utils';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useTranslation } from 'hooks/useTranslation';

import { avatar } from 'utils';

import * as Styled from '../TitleBarRightSection.styled';

const LuminCollaborators = () => {
  const currentUser = useGetCurrentUser();

  const [open, { toggle, close }] = useDisclosure();
  const viewerContext = useContext(ViewerContext);
  const { t } = useTranslation();
  const idleTitle = `(${t('common.idle')})`;
  const anonymousName = `${t('common.anonymous')}`;
  const isLoggedIn = !!currentUser?._id;

  const { onlineMembers } = viewerContext;

  const onlineMemberRemovedDuplicate = removeDuplicateMember({ onlineMembers, currentUser }) as OnlineMember[];

  const renderPopperContent = () =>
    onlineMemberRemovedDuplicate.slice(2).map((member: OnlineMember, index: number) => (
      <MenuItem
        key={index}
        leftSection={
          <Styled.CollaboratorAvatar
            size="small"
            src={isLoggedIn ? avatar.getAvatar(member.avatarRemoteId) : null}
            outline
            $isInPopper
            index={index}
            $idle={!member.isActive}
          >
            {isLoggedIn ? avatar.getTextAvatar(member.name) : avatar.getTextAvatar(` ${index + 1}`)}
          </Styled.CollaboratorAvatar>
        }
      >
        <span>
          {isLoggedIn ? member.name : `${anonymousName} ${index + 1}`} {!member.isActive ? idleTitle : ''}
        </span>
      </MenuItem>
    ));

  const renderItem = (member: OnlineMember, i: number) => {
    const memberName = isLoggedIn ? member.name : `Anonymous ${i + 1}`;
    const idleStatus = !member.isActive ? ` ${idleTitle}` : '';
    const tooltipTitle = `${memberName}${idleStatus}`;

    return (
      <PlainTooltip key={member._id} content={tooltipTitle}>
        <Styled.CollaboratorAvatar
          size="small"
          src={isLoggedIn ? avatar.getAvatar(member.avatarRemoteId) : null}
          outline
          index={i}
          $idle={!member.isActive}
        >
          {isLoggedIn ? avatar.getTextAvatar(member.name) : avatar.getTextAvatar(`Anonymous ${i + 1}`)}
        </Styled.CollaboratorAvatar>
      </PlainTooltip>
    );
  };

  return (
    <Styled.CollaboratorWrapper>
      {onlineMemberRemovedDuplicate.length > 2
        ? onlineMemberRemovedDuplicate.slice(0, 2).map(renderItem)
        : onlineMemberRemovedDuplicate.map(renderItem)}
      {onlineMemberRemovedDuplicate.length > 2 && (
        <Menu
          opened={open}
          onClose={close}
          ComponentTarget={
            <PlainTooltip disabled={open} content={t('viewer.viewMore')}>
              <Styled.CollaboratorAvatar
                size="small"
                src={null}
                outline
                onClick={toggle}
                $active={open}
                $isPopperButton
              >
                + {onlineMemberRemovedDuplicate.length - 2}
              </Styled.CollaboratorAvatar>
            </PlainTooltip>
          }
        >
          {renderPopperContent()}
        </Menu>
      )}
    </Styled.CollaboratorWrapper>
  );
};

export default LuminCollaborators;
