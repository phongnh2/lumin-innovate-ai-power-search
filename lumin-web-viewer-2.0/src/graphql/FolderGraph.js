import { gql } from '@apollo/client';

import { NESTING_DEPTH } from 'features/NestedFolders/constants';

import Fragments from './Fragment';

export const CREATE_PERSONAL_FOLDER = gql`
  mutation createFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const CREATE_ORG_TEAM_FOLDER = gql`
  mutation createOrganizationTeamFolder($input: CreateOrganizationTeamFolderInput!) {
    createOrganizationTeamFolder(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const CREATE_ORGANIZATION_FOLDER = gql`
  mutation createOrganizationFolder($input: CreateOrganizationFolderInput!) {
    createOrganizationFolder(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const EDIT_FOLDER = gql`
  mutation editFolderInfo($input: EditFolderInput!) {
    editFolderInfo(input: $input) {
      _id
      name
      path
      color
      createdAt
    }
  }
`;

export const GET_PERSONAL_FOLDERS = gql`
  query getPersonalFolders($input: GetFolderListInput!) {
    getPersonalFolders(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const GET_ORG_TEAM_FOLDERS = gql`
  query getOrganizationTeamFolders($input: GetOrganizationTeamFoldersInput!) {
    getOrganizationTeamFolders(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const GET_TOTAL_FOLDERS = gql`
  query getTotalFolders($input: GetTotalFoldersInput!) {
    getTotalFolders(input: $input) {
      total
    }
  }
`;

export const GET_ORGANIZATION_FOLDERS = gql`
  query getOrganizationFolders($input: GetOrganizationFoldersInput!) {
    getOrganizationFolders(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const STAR_FOLDER = gql`
  mutation starFolder($folderId: ID!) {
    starFolder(folderId: $folderId) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const ADD_FOLDER_COLOR = gql`
  mutation addFolderColor($color: String!) {
    addFolderColor(color: $color)
  }
`;

export const GET_FOLDER_DETAIL = gql`
  query getFolderDetail($folderId: ID!) {
    getFolderDetail(folderId: $folderId) {
      ...FolderDataDetail
    }
  }
  ${Fragments.FolderDataDetail}
`;

export const GET_FOLDERS_IN_FOLDER = gql`
  query getFoldersInFolder($input: GetFoldersInFolderInput!) {
    getFoldersInFolder(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const DELETE_FOLDER = gql`
  mutation deleteFolder($folderId: ID!, $isNotify: Boolean) {
    deleteFolder(folderId: $folderId, isNotify: $isNotify)
  }
`;

export const SUB_CREATE_FOLDER = gql`
  subscription createFolderSubscription($input: CreateFolderSubscriptionInput!) {
    createFolderSubscription(input: $input) {
      folder {
        ...FolderData
      }
      clientId
    }
  }
  ${Fragments.FolderData}
`;

export const SUB_FOLDER_EVENT = gql`
  subscription folderEventSubscription($input: FolderEventSubscriptionInput!) {
    folderEventSubscription(input: $input) {
      workspaceId
      eventType
      total
    }
  }
`;

export const SUB_UPDATE_FOLDER = gql`
  subscription updateFolderSubscription($input: UpdateFolderSubscriptionInput!) {
    updateFolderSubscription(input: $input) {
      folder {
        ...FolderData
      }
      folders {
        ...FolderData
      }
      userId
      actorId
      subscriptionEvent
    }
  }
  ${Fragments.FolderData}
`;

export const GET_PERSONAL_FOLDERS_IN_ORG = gql`
  query getPersonalFoldersInOrg($input: GetOrganizationFoldersInput!) {
    getPersonalFoldersInOrg(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const CREATE_PERSONAL_FOLDER_IN_ORG = gql`
  mutation createPersonalFolderInOrg($input: CreateOrganizationFolderInput!) {
    createPersonalFolderInOrg(input: $input) {
      ...FolderData
    }
  }
  ${Fragments.FolderData}
`;

export const DELETE_MULTIPLE_FOLDER = gql`
  mutation deleteMultipleFolder($input: DeleteMultipleFolderInput!) {
    deleteMultipleFolder(input: $input)
  }
`;

function buildFolderLevels(depth) {
  if (depth <= 0) return '';
  return `
    folders {
      ...FolderData
      ${buildFolderLevels(depth - 1)}
    }
  `;
}

export const GET_FOLDER_TREE = gql`
  query getFolderTree($folderId: ID!) {
    getFolderTree(folderId: $folderId) {
      ...FolderData
      ${buildFolderLevels(NESTING_DEPTH - 1)}
    }
  }
  ${Fragments.FolderData}
`;

export const GET_FOLDERS_AVAILABILITY = gql`
  query getFoldersAvailability($input: GetFoldersAvailabilityInput!) {
    getFoldersAvailability(input: $input) {
      personal
      organization
      teams
    }
  }
`;
