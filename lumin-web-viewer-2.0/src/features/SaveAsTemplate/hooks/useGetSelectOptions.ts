import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTranslation } from 'hooks/useTranslation';

import { IOrganization } from 'interfaces/organization/organization.interface';

const useGetSelectOptions = (org: IOrganization) => {
  const { t } = useTranslation();

  return [
    {
      group: '',
      items: [
        {
          label: t('viewer.saveAsTemplate.myTemplates'),
          value: 'my-templates',
          type: DestinationLocation.PERSONAL,
          id: org._id,
        },
        {
          label: t('viewer.saveAsTemplate.workspaceTemplates', { workspaceName: org.name }),
          value: 'workspace-templates',
          avatarRemoteId: org.avatarRemoteId,
          type: DestinationLocation.ORGANIZATION,
          id: org._id,
        },
      ],
    },
    {
      group: t('viewer.saveAsTemplate.spaceTemplates'),
      items: org.teams.map((team) => ({
        label: team.name,
        value: team._id,
        avatarRemoteId: team.avatarRemoteId,
        type: DestinationLocation.ORGANIZATION_TEAM,
        id: team._id,
      })),
    },
  ];
};

export default useGetSelectOptions;
