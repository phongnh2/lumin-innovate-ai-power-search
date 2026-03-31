import { client } from '@app-apollo';

import { GET_DOCUMENTS_IN_FOLDER } from 'graphQL/DocumentGraph';
import { GET_ORG_TEAM_FOLDERS, GET_ORGANIZATION_FOLDERS, GET_PERSONAL_FOLDERS_IN_ORG } from 'graphQL/FolderGraph';
import { GET_ORGANIZATION_DOCUMENTS } from 'graphQL/OrganizationGraph';
import { GET_ORGANIZATION_TEAM_DOCUMENTS } from 'graphQL/TeamGraph';

import { MINIMUM_DOCUMENT_QUANTITY, modifiedFilter, ownerFilter } from 'constants/documentConstants';

import { IFolder } from 'interfaces/folder/folder.interface';

import { ChooseFileGetDocumentsPayload } from '../types';

export const getPersonalFoldersInOrg = async (orgId: string) => {
  const res = await client.query<{
    getPersonalFoldersInOrg: IFolder[];
  }>({
    query: GET_PERSONAL_FOLDERS_IN_ORG,
    variables: {
      input: {
        sortOptions: {
          createdAt: 'DESC',
        },
        orgId,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getPersonalFoldersInOrg;
};

export const getOrganizationFolders = async (orgId: string) => {
  const res = await client.query<{
    getOrganizationFolders: IFolder[];
  }>({
    query: GET_ORGANIZATION_FOLDERS,
    variables: {
      input: {
        sortOptions: {
          createdAt: 'DESC',
        },
        orgId,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getOrganizationFolders;
};

export const getOrganizationTeamFolders = async (teamId: string) => {
  const res = await client.query<{
    getOrganizationTeamFolders: IFolder[];
  }>({
    query: GET_ORG_TEAM_FOLDERS,
    variables: {
      input: {
        sortOptions: {
          createdAt: 'DESC',
        },
        teamId,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getOrganizationTeamFolders;
};

export const getOrganizationDocuments = async (orgId: string, tab: string, cursor?: string) => {
  const res = await client.query<{
    getDocuments: ChooseFileGetDocumentsPayload;
  }>({
    query: GET_ORGANIZATION_DOCUMENTS,
    variables: {
      input: {
        filter: {
          ownedFilterCondition: ownerFilter.byAnyone,
          lastModifiedFilterCondition: modifiedFilter.modifiedByAnyone,
        },
        query: {
          minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
          ...(cursor && { cursor }),
        },
        orgId,
        tab,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getDocuments;
};

export const getOrganizationTeamDocuments = async (teamId: string, cursor?: string) => {
  const res = await client.query<{
    getDocuments: ChooseFileGetDocumentsPayload;
  }>({
    query: GET_ORGANIZATION_TEAM_DOCUMENTS,
    variables: {
      input: {
        filter: {
          ownedFilterCondition: ownerFilter.byAnyone,
          lastModifiedFilterCondition: modifiedFilter.modifiedByAnyone,
        },
        query: {
          minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
          ...(cursor && { cursor }),
        },
        teamId,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getDocuments;
};

export const getDocumentsInFolder = async (folderId: string, cursor?: string) => {
  const res = await client.query<{
    getDocuments: ChooseFileGetDocumentsPayload;
  }>({
    query: GET_DOCUMENTS_IN_FOLDER,
    variables: {
      input: {
        filter: {
          ownedFilterCondition: ownerFilter.byAnyone,
          lastModifiedFilterCondition: modifiedFilter.modifiedByAnyone,
        },
        query: {
          minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
          ...(cursor && { cursor }),
        },
        folderId,
      },
    },
    fetchPolicy: 'no-cache',
  });
  return res.data.getDocuments;
};
