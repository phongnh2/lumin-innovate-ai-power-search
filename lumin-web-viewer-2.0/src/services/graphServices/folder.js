import {
  CREATE_PERSONAL_FOLDER,
  CREATE_ORG_TEAM_FOLDER,
  CREATE_ORGANIZATION_FOLDER,
  GET_PERSONAL_FOLDERS,
  GET_ORG_TEAM_FOLDERS,
  GET_ORGANIZATION_FOLDERS,
  EDIT_FOLDER,
  STAR_FOLDER,
  ADD_FOLDER_COLOR,
  GET_FOLDER_DETAIL,
  DELETE_FOLDER,
  GET_PERSONAL_FOLDERS_IN_ORG,
  CREATE_PERSONAL_FOLDER_IN_ORG,
  GET_TOTAL_FOLDERS,
  DELETE_MULTIPLE_FOLDER,
  GET_FOLDERS_IN_FOLDER,
  GET_FOLDER_TREE,
  GET_FOLDERS_AVAILABILITY,
} from 'graphQL/FolderGraph';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

export const createPersonalFolder = async ({ name, color, parentId }) => {
  const input = { name, color, ...parentId && { parentId } };
  const res = await client.mutate({
    mutation: CREATE_PERSONAL_FOLDER,
    variables: {
      input,
    },
  });
  return res.data.createFolder;
};

export const createOrgTeamFolder = async ({
  name, color, parentId, teamId,
}) => {
  const input = {
    name, color, teamId, ...parentId && { parentId },
  };
  const res = await client.mutate({
    mutation: CREATE_ORG_TEAM_FOLDER,
    variables: {
      input,
    },
  });
  return res.data.createOrganizationTeamFolder;
};

export const createOrganizationFolder = async ({
  name, color, parentId, orgId, isNotify,
}) => {
  const input = {
    name, color, orgId, isNotify, ...parentId && { parentId },
  };
  const res = await client.mutate({
    mutation: CREATE_ORGANIZATION_FOLDER,
    variables: {
      input,
    },
  });
  return res.data.createOrganizationFolder;
};

export const editFolderInfo = async ({ folderId, updateProperties }) => {
  const res = await client.mutate({
    mutation: EDIT_FOLDER,
    variables: {
      input: {
        folderId, updateProperties,
      },
    },
  });
  return res.data.editFolderInfo;
};

export const getPersonalFolders = async ({ sortOptions, parentId, isStarredTab, searchKey, fetchOptions }) => {
  const input = {
    sortOptions,
    isStarredTab,
    searchKey,
    ...(parentId && { parentId }),
  };
  const res = await client.query({
    query: GET_PERSONAL_FOLDERS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
    context: {
      fetchOptions,
    }
  });
  return res.data.getPersonalFolders;
};

export const getOrgTeamFolders = async ({ searchKey, sortOptions, parentId, teamId, fetchOptions }) => {
  const input = {
    sortOptions,
    teamId,
    searchKey,
    ...(parentId && { parentId }),
  };
  const res = await client.query({
    query: GET_ORG_TEAM_FOLDERS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
    context: {
      fetchOptions,
    }
  });
  return res.data.getOrganizationTeamFolders;
};

export const getTotalFolders = async ({ refId, targetType }) => {
  const input = {
    refId,
    targetType,
  };
  const res = await client.query({
    query: GET_TOTAL_FOLDERS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
  });
  return res.data.getTotalFolders?.total;
};

export const getFoldersInFolder = async ({ folderId, sortOptions, searchKey, isStarredTab, fetchOptions }) => {
  const input = {
    folderId,
    searchKey,
    sortOptions,
    isStarredTab,
  };

  const res = await client.query({
    query: GET_FOLDERS_IN_FOLDER,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
    context: {
      fetchOptions,
    }
  });
  return res.data.getFoldersInFolder;
};

export const getOrganizationFolders = async ({
  sortOptions,
  parentId,
  orgId,
  isStarredTab,
  searchKey,
  fetchOptions,
}) => {
  const input = {
    sortOptions,
    orgId,
    isStarredTab,
    searchKey,
    ...(parentId && { parentId }),
  };
  const res = await client.query({
    query: GET_ORGANIZATION_FOLDERS,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
    context: {
      fetchOptions,
    }
  });
  return res.data.getOrganizationFolders;
};

export const starFolder = async (folderId) => {
  const res = await client.mutate({
    mutation: STAR_FOLDER,
    variables: {
      folderId,
    },
  });
  return res.data.starFolder;
};

export const addColor = async (color) => {
  const res = await client.mutate({
    mutation: ADD_FOLDER_COLOR,
    variables: {
      color,
    },
  });
  return res.data.addFolderColor;
};

export const getFolderDetail = async (folderId) => {
  const res = await client.mutate({
    mutation: GET_FOLDER_DETAIL,
    variables: {
      folderId,
    },
  });
  return res.data.getFolderDetail;
};

export const deleteFolder = async (folderId, isNotify) => {
  const res = await client.mutate({
    mutation: DELETE_FOLDER,
    variables: {
      folderId,
      isNotify,
    },
  });
  return res.data.deleteFolder;
};

export const getPersonalFoldersInOrg = async ({ orgId, sortOptions, searchKey, fetchOptions }) => {
  const res = await client.query({
    query: GET_PERSONAL_FOLDERS_IN_ORG,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input: {
        orgId,
        sortOptions,
        parentId: null,
        isStarredTab: false,
        searchKey,
      },
    },
    context: {
      fetchOptions,
    }
  });
  return res.data.getPersonalFoldersInOrg;
};

export const createPersonalFolderInOrg = async ({ name, color, parentId, orgId }) => {
  const input = {
    name,
    color,
    orgId,
    ...(parentId && { parentId }),
  };
  const res = await client.mutate({
    mutation: CREATE_PERSONAL_FOLDER_IN_ORG,
    variables: {
      input,
    },
  });
  return res.data.createPersonalFolderInOrg;
};

export const deleteMultipleFolder = async ({ folderIds, isNotify, clientId }) => {
  const res = await client.mutate({
    mutation: DELETE_MULTIPLE_FOLDER,
    variables: {
      input: {
        folderIds,
        isNotify,
        clientId,
      },
    },
  });
  return res.data.deleteMultipleFolder;
};

export const getFolderTree = async (folderId) => {
  const res = await client.query({
    query: GET_FOLDER_TREE,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      folderId,
    },
  });
  return res.data.getFolderTree;
};

export const getFoldersAvailability = async (orgId) => {
  const input = {
    orgId,
  };
  const res = await client.query({
    query: GET_FOLDERS_AVAILABILITY,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
    variables: {
      input,
    },
  });
  return res.data.getFoldersAvailability;
};
