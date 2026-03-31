import { AvatarGroup, Avatar, Text, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentOrganization, useGetCurrentTeam, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { avatar } from 'utils';

import { InviteLinkIntroductionPopover } from 'features/InviteLinkIntroductionPopover';
import useHandleInviteLinkPopover from 'features/InviteLinkIntroductionPopover/hooks/useHandleInviteLinkPopover';

import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAMS_TEXT } from 'constants/teamConstant';

import { ITeam } from 'interfaces/team/team.interface';

import MemberGroupAvatarSkeleton from './MemberGroupAvatarSkeleton';
import { useGetRepresentativeMembers } from '../../hooks';

import styles from './MemberGroupAvatar.module.scss';

const MemberGroupAvatar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isFocusing, searchKey } = useSelector(selectors.getPageSearchData);

  const { isTemplatesPage } = useTemplatesPageMatch();

  const { isOpen, setOpen, renderAddMemberModal, handleClosePopover, onClickTryItNow, setIsHovering } =
    useHandleInviteLinkPopover();

  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentOrganization = useGetCurrentOrganization();

  const { isFetching, representativeMembers } = useGetRepresentativeMembers();
  const { onKeyDown } = useKeyboardAccessibility();

  const foundTeam = currentOrganization?.teams?.find((team) => team._id === currentTeam?._id);

  const totalActiveMembers = useMemo(() => {
    if (!currentOrganization) {
      return 0;
    }
    if (foundTeam) {
      return foundTeam.totalMembers;
    }
    return currentOrganization.totalActiveMember;
  }, [currentOrganization, foundTeam]);

  if (isFetching) {
    return <MemberGroupAvatarSkeleton />;
  }

  if (!isFetching && !representativeMembers.length) return null;

  const handleNavigate = () => {
    if (!currentOrganization) {
      return;
    }
    const { url } = currentOrganization;
    if (currentTeam && foundTeam) {
      navigate(`/${ORG_TEXT}/${url}/${TEAMS_TEXT}/${foundTeam._id}/members`);
      return;
    }
    navigate(`/${ORG_TEXT}/${url}/members`);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={styles.membersContainer}
        onClick={handleNavigate}
        onKeyDown={onKeyDown}
      >
        <AvatarGroup
          size="xs"
          max={totalActiveMembers > 5 ? 5 : totalActiveMembers}
          total={totalActiveMembers}
          variant="outline"
          propsItems={representativeMembers.map((member) => ({
            src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
            name: member.name,
          }))}
          renderItem={(props) => <Avatar {...props} />}
        />
        <InviteLinkIntroductionPopover
          isOpen={!(currentTeam && foundTeam) && !(isFocusing || searchKey) && isOpen}
          setOpen={setOpen}
          handleClosePopover={handleClosePopover}
          onClickTryItNow={onClickTryItNow}
          setIsHovering={setIsHovering}
        >
          <PlainTooltip
            content={t('avatarGroupSection.tooltip', {
              type: (isTemplatesPage ? t('common.templates') : t('common.documents')).toLowerCase(),
              location: foundTeam ? t('terms:team') : t('terms:organization'),
            })}
            maw={237}
            disabled={isOpen}
          >
            <Text size="md" type="label" color="var(--kiwi-colors-surface-on-surface)">
              {totalActiveMembers === 1
                ? t('avatarGroupSection.onePerson')
                : t('avatarGroupSection.multiplePeople', { count: totalActiveMembers })}
            </Text>
          </PlainTooltip>
        </InviteLinkIntroductionPopover>
      </div>
      {renderAddMemberModal()}
    </>
  );
};

export default MemberGroupAvatar;
