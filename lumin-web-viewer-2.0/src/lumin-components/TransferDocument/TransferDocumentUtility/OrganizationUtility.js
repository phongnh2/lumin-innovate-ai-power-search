/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/no-unresolved
import { BuildingsIcon } from '@luminpdf/icons/dist/csr/Buildings';
// eslint-disable-next-line import/no-unresolved
import { UsersThreeIcon } from '@luminpdf/icons/dist/csr/UsersThree';
import React from 'react';

import organizationServices from 'services/organizationServices';

import avatarUtils from 'utils/avatar';
import FolderUtils from 'utils/folder';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { ORGANIZATION_ROLES, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { TEAM_ROLES } from 'constants/teamConstant';

import BaseUtility from './BaseUtility';
import folderUtility from './FolderUtility';

class OrganizationUtility extends BaseUtility {
  getInfoOf(target) {
    if (!target) {
      return {};
    }
    switch (target.type) {
      case DOCUMENT_TYPE.ORGANIZATION: {
        const { organization: selectedOrganization } = this.orgData.find(
          ({ organization }) => organization._id === target.id
        );

        return {
          ownedId: selectedOrganization._id,
          type: target.type,
          name: selectedOrganization.name,
          isAdmin: [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(
            selectedOrganization.userRole.toUpperCase()
          ),
          totalMember: selectedOrganization.totalActiveMember,
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        const { organization: selectedOrganization } = this.orgData.find(({ organization }) =>
          organization.teams.find((team) => team._id === target.id)
        );
        const selectedTeam = selectedOrganization.teams.find((team) => team._id === target.id);
        return {
          ownedId: selectedTeam._id,
          type: target.type,
          name: selectedTeam.name,
          isAdmin: [TEAM_ROLES.ADMIN, TEAM_ROLES.MODERATOR].includes(selectedTeam.roleOfUser),
          belongsTo: {
            id: selectedOrganization._id,
            name: selectedOrganization.name,
          },
        };
      }
      case DOCUMENT_TYPE.FOLDER: {
        return this.getInfoOf(target.belongsTo);
      }
      default:
        break;
    }

    return {};
  }

  getSuccessMessage = (documentType, content, { parentName } = {}) => {
    let successMessage = super.getSuccessMessage(documentType, content);
    switch (documentType) {
      case DOCUMENT_TYPE.ORGANIZATION: {
        successMessage = (
          <>
            {this.formatStrongText(FolderUtils.shorten(content))} {ORGANIZATION_TEXT}
          </>
        );
        break;
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        successMessage = (
          <>
            {this.formatStrongText(FolderUtils.shorten(content))} team in{' '}
            {this.formatStrongText(FolderUtils.shorten(parentName))} {ORGANIZATION_TEXT}
          </>
        );
        break;
      }
      default:
        break;
    }

    return successMessage;
  };

  getBreadcrumb({ t, inOrg, inTeam, src } = {}) {
    const main = {
      name: `${ORGANIZATION_TEXT.toUpperCase()}S`,
      refetch: {
        newExpanded: (props) => this.getAllExpandedList({ t, organizationOnly: true, ...props }),
        newBreadcrumb: () => this.getBreadcrumb({ t }),
      },
    };
    if (inOrg) {
      const selectedOrganization = this.orgData.find(
        ({ organization }) => organization._id === src || organization.teams.find((team) => team._id === src)
      );
      return [main, { name: selectedOrganization.organization.name }];
    }

    if (inTeam) {
      const selectedOrganization = this.orgData.find(({ organization }) =>
        organization.teams.find((team) => team._id === src)
      );
      const selectedTeam = selectedOrganization.organization.teams.find((team) => team._id === src);
      return [
        main,
        {
          name: selectedOrganization.organization.name,
          refetch: {
            newExpanded: () => this.getAllExpandedListOfOrganization(t, selectedOrganization.organization),
            newBreadcrumb: () => this.getBreadcrumb({ t, inOrg: true, src: selectedOrganization.organization._id }),
          },
        },
        {
          name: selectedTeam.name,
        },
      ];
    }
    return [
      {
        name: `${ORGANIZATION_TEXT.toUpperCase()}S`,
      },
    ];
  }

  getAllExpandedList = async ({
    t,
    organizationOnly = false,
    allOrgExpanded = false,
    orgTeamOnly = false,
    initialOrgOnly = false,
    src,
  }) => {
    if (!this.orgData) {
      this.orgData = await organizationServices.getCopyDocumentOrgData();
    }
    if (organizationOnly) {
      if (initialOrgOnly) {
        const selectedOrganization = this.orgData.find(
          ({ organization }) => organization._id === src || organization.teams.find((team) => team._id === src)
        );
        return [
          {
            sourceType: DOCUMENT_TYPE.ORGANIZATION,
            items: this.intercept(t, [selectedOrganization]),
          },
        ];
      }
      return [
        {
          sourceType: DOCUMENT_TYPE.ORGANIZATION,
          items: this.intercept(t, this.orgData),
        },
      ];
    }
    if (allOrgExpanded) {
      const selectedOrganization = this.orgData.find(
        ({ organization }) => organization._id === src || organization.teams.find((team) => team._id === src)
      );
      return this.getAllExpandedListOfOrganization(t, selectedOrganization.organization);
    }

    if (orgTeamOnly) {
      const selectedOrganization = this.orgData.find(({ organization }) =>
        organization.teams.find((team) => team._id === src)
      );
      const selectedTeam = selectedOrganization.organization.teams.find((team) => team._id === src);
      return this.getAllExpandedListOfTeam(selectedTeam);
    }
    return [];
  };

  getAllExpandedListOfOrganization = (t, organization) => [
    {
      sourceType: DOCUMENT_TYPE.FOLDER,
      title: t('common.folders'),
      items: folderUtility.intercept(organization.folders, { id: organization._id, type: DOCUMENT_TYPE.ORGANIZATION }),
    },
    {
      sourceType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
      title: t('common.teams'),
      items: this.interceptTeams(t, organization.teams, { parentName: organization.name }),
    },
  ];

  getAllExpandedListOfTeam = (team) => [
    {
      sourceType: DOCUMENT_TYPE.FOLDER,
      items: folderUtility.intercept(team.folders, { id: team._id, type: DOCUMENT_TYPE.ORGANIZATION_TEAM }),
    },
  ];

  intercept = (t, orgData) =>
    orgData.map(({ organization }) => ({
      id: organization._id,
      content: organization.name,
      avatar: {
        src: avatarUtils.getAvatar(organization.avatarRemoteId),
        defaultSrc: <BuildingsIcon size={20} color="var(--kiwi-colors-surface-on-surface)" />,
      },
      extra: {
        showArrow: Boolean(organization.teams.length || organization.folders.length),
        tooltipText: t('modalMakeACopy.goToThis', { text: t('organization', { ns: 'terms' }) }),
        refetch: {
          newExpanded: () => this.getAllExpandedListOfOrganization(t, organization),
          newBreadcrumb: () => this.getBreadcrumb({ t, inOrg: true, src: organization._id }),
        },
        totalMember: organization.totalMember,
      },
      orgUrl: organization.url,
      source: DOCUMENT_TYPE.ORGANIZATION,
      teams: organization.teams,
    }));

  interceptTeams = (t, teams, { parentName, parentId }) =>
    teams.map((team) => ({
      id: team._id,
      content: team.name,
      parentName,
      parentId,
      avatar: {
        src: avatarUtils.getAvatar(team.avatarRemoteId),
        defaultSrc: <UsersThreeIcon color="var(--kiwi-colors-surface-on-surface)" size={20} />,
      },
      extra: {
        showArrow: Boolean(team.folders.length),
        tooltipText: t('modalMakeACopy.goToThis', { text: t('team', { ns: 'terms' }) }),
        refetch: {
          newExpanded: () => this.getAllExpandedListOfTeam(team),
          newBreadcrumb: () => this.getBreadcrumb({ t, inTeam: true, src: team._id }),
        },
      },
      source: DOCUMENT_TYPE.ORGANIZATION_TEAM,
    }));

  reset() {
    this.orgData = null;
  }
}

export default new OrganizationUtility();
