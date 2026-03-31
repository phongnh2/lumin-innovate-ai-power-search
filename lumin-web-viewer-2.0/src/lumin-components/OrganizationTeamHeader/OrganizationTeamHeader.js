import PropTypes from 'prop-types';
import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router';

import OrganizationTeamContext from 'screens/OrganizationTeam/Context';

import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import Breadcrumb from 'lumin-components/Shared/Breadcrumb';
import Tabs from 'luminComponents/Shared/Tabs';

import { useDesktopMatch, useEnableWebReskin, useTranslation } from 'hooks';

import { avatar } from 'utils';
import stringUtils from 'utils/string';

import { ORG_TEAM_ROLE, ORG_TEXT } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { TEAMS_TEXT } from 'constants/teamConstant';

import { ROLE } from '../../screens/Teams/TeamConstant';

import {
  StyledTopHeader,
  StyledTeamInfoContainer,
  StyledTeamAvatar,
  StyledTeamInfo,
  StyledTeamName,
  StyledTagList,
  StyledTag,
  StyledTeamTabsContainer,
  StyledBreadcrumbContainer,
  StyledBreadcrumbContainerReskin,
  useTabStyles,
} from './OrganizationTeamHeader.styled';

const propsTypes = {
  teamTabs: PropTypes.array.isRequired,
  organization: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};
function OrganizationTeamHeader({ currentUser, teamTabs, organization }) {
  const { t } = useTranslation();
  const { currentTeam: team } = useContext(OrganizationTeamContext);
  const isDesktopMatched = useDesktopMatch();
  const navigate = useNavigate();
  const { tab: currentTab } = useParams();
  const tabClasses = useTabStyles();

  const { isEnableReskin } = useEnableWebReskin();

  const { data: currentOrganization } = organization;
  const teamListLink = `/${ORG_TEXT}/${currentOrganization.url}/${TEAMS_TEXT}`;

  useEffect(() => {
    const hasTab = teamTabs.some((tab) => tab.id === currentTab);
    if (!hasTab) {
      navigate(`${teamListLink}/${team._id}/${teamTabs[0].id}`);
    }
  }, [currentTab, navigate, teamListLink, teamTabs, team._id]);

  const onTabClick = (tabName) => {
    // To DO
    navigate(`${teamListLink}/${team._id}/${tabName}`);
  };

  const adminText = t('roleText.spaceAdmin');

  const userRole =
    team.owner._id === currentUser._id && team.roleOfUser === ROLE.ADMIN.toLowerCase() ? adminText : t('common.member');

  const breadcrumbData = [
    {
      title: t('common.teams'),
      url: teamListLink,
    },
    {
      title: stringUtils.getShortString(team.name),
      tooltip: team.name,
    },
  ];

  const ReskinComponents = isEnableReskin ? StyledBreadcrumbContainerReskin : StyledBreadcrumbContainer;

  return (
    <>
      {isDesktopMatched ? (
        <PageTitlePortal.Element>
          <ReskinComponents>
            <Breadcrumb data={breadcrumbData} />
          </ReskinComponents>
        </PageTitlePortal.Element>
      ) : (
        <ReskinComponents>
          <Breadcrumb data={breadcrumbData} />
        </ReskinComponents>
      )}

      <StyledTopHeader>
        <StyledTeamInfoContainer>
          <StyledTeamAvatar size={56} hasBorder src={avatar.getAvatar(team.avatarRemoteId)}>
            {avatar.getTextAvatar(team.name)}
          </StyledTeamAvatar>
          <StyledTeamInfo>
            <StyledTeamName>{team.name}</StyledTeamName>
            <StyledTagList>
              <StyledTag value={team.roleOfUser} label={userRole} />
            </StyledTagList>
          </StyledTeamInfo>
        </StyledTeamInfoContainer>

        {team.roleOfUser.toUpperCase() === ORG_TEAM_ROLE.ADMIN && (
          <StyledTeamTabsContainer>
            <Tabs
              classes={tabClasses}
              onChange={onTabClick}
              tabs={teamTabs}
              value={currentTab}
              activeBarColor={Colors.SECONDARY_50}
            />
          </StyledTeamTabsContainer>
        )}
      </StyledTopHeader>
    </>
  );
}

OrganizationTeamHeader.propTypes = propsTypes;

export default OrganizationTeamHeader;
