/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Avatar, Icomoon, Text, IconButton, PlainTooltip, Button } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { SubSidebarItem } from '@web-new-ui/components/SubSidebarItem';

import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import selectors from 'selectors';

import { SubMenuTypes } from 'luminComponents/ReskinLayout/components/LeftSidebarDrawer/LeftSidebarDrawer.constants';

import { useNetworkStatus, useTranslation } from 'hooks';
import useCreateTeam from 'hooks/useCreateTeam';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { avatar } from 'utils';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import SidebarBanner from 'features/SidebarBanner';

import { AWS_EVENTS } from 'constants/awsEvents';
import { TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { MAX_DISPLAY_SPACES_ON_SWITCHER, ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT, TEAMS_TEXT } from 'constants/teamConstant';

import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';
import { ITeam } from 'interfaces/team/team.interface';

import styles from '../../LeftSubSidebar.module.scss';
import { DocumentItemsContainer } from '../DocumentItemsContainer';
import { SkeletonSubSidebar } from '../SkeletonSubSidebar';
import TryTeamSection from '../TryTeamSection';

const CreateTeamModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/CreateTeamModal'));

const OrganizationSubSidebar = ({
  type = SubMenuTypes.Documents,
}: {
  type?: SubMenuTypes.Documents | SubMenuTypes.Templates;
}): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orgTeams = useSelector<unknown, ITeam[]>(selectors.getTeams, shallowEqual) || [];
  const { data: currentOrg, loading } =
    useSelector<unknown, IOrganizationData>(selectors.getCurrentOrganization, shallowEqual) || {};
  const { url } = currentOrg || {};
  const { onClose, onCreate, openCreateTeamModal, onCreateTeamClick } = useCreateTeam(currentOrg);
  const { isOffline } = useNetworkStatus();
  const { onKeyDown } = useKeyboardAccessibility();

  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const [disabledTooltip, setDisabledTooltip] = useState(false);

  const orgLink = `/${ORG_TEXT}/${url}`;
  const documentOrg = `${orgLink}/${type}`;
  const hasReachedMaxDisplaySpaces = orgTeams.length > MAX_DISPLAY_SPACES_ON_SWITCHER;

  const navigateToTeamList = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${ORG_TEXT}/${currentOrg.url}/${TEAMS_TEXT}`);
  };

  const navigateToTeamMembers = (teamId: string) => navigate(`/${ORG_TEXT}/${url}/${TEAMS_TEXT}/${teamId}/members`);

  const onMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setDisabledTooltip(false);
    }, TOOLTIP_OPEN_DELAY);
  };

  const onMouseEnter = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setDisabledTooltip(true);
  };

  const renderSpaceItem = useCallback(() => {
    const spaces = orgTeams.slice(0, MAX_DISPLAY_SPACES_ON_SWITCHER).map((team) => ({
      name: team.name,
      id: team._id,
      avatarRemoteId: team.avatarRemoteId,
    }));
    return spaces.map((space) => (
      <SubSidebarItem
        key={space.id}
        title={space.name}
        disabledTooltip={disabledTooltip}
        rightElement={
          <PlainTooltip
            withinPortal={false}
            floatingStrategy="fixed"
            content={t('sidebar.viewAllTargetMembers', { target: t('team', { ns: 'terms' }) })}
          >
            <IconButton
              size="md"
              icon="users-md"
              color="var(--kiwi-colors-surface-on-surface)"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigateToTeamMembers(space.id);
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          </PlainTooltip>
        }
        leftElement={
          <Avatar
            src={avatar.getAvatar(space.avatarRemoteId) || DefaultTeamAvatar}
            name={space.name}
            size="xs"
            variant="outline"
          />
        }
        to={`${documentOrg}/${TEAM_TEXT}/${space.id}`}
        activeTab="documentTab"
        data-cy="team_sidebar"
        data-lumin-btn-name={NavigationNames.SPACE}
        data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
      />
    ));
  }, [orgTeams, currentOrg, documentOrg, disabledTooltip]);

  if (loading) return <SkeletonSubSidebar />;

  if (!currentOrg) return null;

  return (
    <>
      <div className={styles.itemsContainer}>
        <DocumentItemsContainer t={t} baseRoute={documentOrg} type={type} />
      </div>
      {orgTeams.length > 0 ? (
        <div className={styles.itemsWrapper}>
          <PlainTooltip disabled={disabledTooltip} openDelay={TOOLTIP_OPEN_DELAY} content={t('sidebar.viewAllSpaces')}>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={onKeyDown}
              onClick={navigateToTeamList}
              className={styles.spaceTitleContainer}
            >
              <Text color="var(--kiwi-colors-surface-on-surface-variant)" size="xs" type="headline">
                {t('sidebar.spaces')}
              </Text>
              <PlainTooltip
                content={hasReachedMaxDisplaySpaces ? t('sidebar.viewAllSpaces') : t('sidebar.createSpace')}
                disabled={isOffline}
              >
                {hasReachedMaxDisplaySpaces ? (
                  <Button
                    className={styles.rightButton}
                    variant="text"
                    size="sm"
                    onClick={navigateToTeamList}
                    data-cy="view_all_teams_button"
                    disabled={isOffline}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <Text type="label" size="sm" color="var(--kiwi-colors-core-secondary)">
                      {t('common.viewAll')}
                    </Text>
                  </Button>
                ) : (
                  <IconButton
                    icon="plus-lg"
                    data-cy="create_team_plus_button"
                    data-lumin-btn-name={NavigationNames.CREATE_SPACE}
                    data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
                    className={styles.rightButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateTeamClick();
                    }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    disabled={isOffline}
                  />
                )}
              </PlainTooltip>
            </div>
          </PlainTooltip>
          <div className={styles.itemsContainer}>{renderSpaceItem()}</div>
        </div>
      ) : (
        <TryTeamSection onCreateTeamClick={onCreateTeamClick} disabled={isOffline} />
      )}
      <div className={styles.itemsWrapper}>
        <Text
          color="var(--kiwi-colors-surface-on-surface-variant)"
          size="xs"
          type="headline"
          className={styles.exploreTitle}
        >
          {t('sidebar.explore')}
        </Text>
        <div className={styles.itemsContainer}>
          <SubSidebarItem
            leftElement={<Icomoon type="sparkles-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />}
            title={t('sidebar.templateGallery')}
            to="/webopt"
            activeTab="documentTab"
            data-cy="template_gallery"
            data-lumin-btn-name={NavigationNames.TEMPLATES_GALLERY}
            data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
          />
        </div>
      </div>
      <SidebarBanner />
      {openCreateTeamModal && <CreateTeamModal open onClose={onClose} onCreate={onCreate} />}
    </>
  );
};

export default OrganizationSubSidebar;
