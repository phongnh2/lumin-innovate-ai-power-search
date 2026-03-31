import { DELETE_DOCUMENT_TEMPLATE } from 'graphQL/DocumentTemplateGraph';
import {
  GET_PERSONAL_TEMPLATES,
  GET_ORGANIZATION_TEMPLATES,
  GET_TEAM_TEMPLATES,
  GET_TEMPLATE_BY_ID,
  UPLOAD_PERSONAL_TEMPLATE,
  UPLOAD_TEAM_TEMPLATE,
  UPLOAD_ORGANIZATION_TEMPLATE,
  USE_TEMPLATE,
  EDIT_TEMPLATE,
  DELETE_TEMPLATE,
  CREATE_TEMPLATE_BASE_ON_DOCUMENT,
  CHECK_REACH_DAILY_TEMPLATE_UPLOAD_LIMIT,
  UPLOAD_DOCUMENT_TEMPLATE_TO_PERSONAL,
  UPLOAD_DOCUMENT_TEMPLATE_TO_ORG_TEAM,
  UPLOAD_DOCUMENT_TEMPLATE_TO_ORGANIZATION,
  CREATE_DOCUMENT_FROM_DOCUMENT_TEMPLATE,
} from 'graphQL/TemplateGraph';

import errorUtils from 'utils/error';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client, clientUpload } from '../../apollo';

export async function getPersonalTemplate({ limit, offset, searchKey, signal }) {
  const res = await client.query({
    query: GET_PERSONAL_TEMPLATES,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      pagingOption: {
        limit,
        offset,
        searchKey,
      },
    },
    context: {
      fetchOptions: {
        signal,
      },
    },
  });
  return res.data.getPersonalTemplates;
}
export async function getOrganizationTemplates({ orgId, tab, limit, offset, searchKey, signal }) {
  const res = await client.query({
    query: GET_ORGANIZATION_TEMPLATES,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      orgId,
      tab,
      pagingOption: {
        limit,
        offset,
        searchKey,
      },
    },
    context: {
      fetchOptions: {
        signal,
      },
    },
  });
  return res.data.getOrganizationTemplates;
}
export async function getTeamTemplates({ teamId, limit, offset, searchKey, signal }) {
  const res = await client.query({
    query: GET_TEAM_TEMPLATES,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      teamId,
      pagingOption: {
        limit,
        offset,
        searchKey,
      },
    },
    context: {
      fetchOptions: {
        signal,
      },
    },
  });
  return res.data.getTeamTemplates;
}

export async function getTemplateById(templateId, { withSignedUrl, increaseView }) {
  const res = await client.query({
    query: GET_TEMPLATE_BY_ID,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      templateId,
      withSignedUrl,
      increaseView,
    },
  });
  return res.data.getTemplateById;
}

export const uploadPersonalTemplate = async ({ file, thumbnail, name, description, cancelToken, onUploadProgress }) => {
  const uploadFiles = [
    {
      type: 'template',
      file,
    },
    thumbnail && {
      type: 'thumbnail',
      file: thumbnail,
    },
  ].filter(Boolean);
  const res = await clientUpload({
    mutation: UPLOAD_PERSONAL_TEMPLATE,
    variables: {
      files: uploadFiles,
      input: {
        name,
        description,
      },
    },
    cancelToken,
    onUploadProgress,
  });

  const { errors } = res.data;
  if (errors && errors.length) {
    throw errorUtils.deriveAxiosGraphToHttpError(errors[0]);
  }
  return res.data.data.uploadPersonalTemplate;
};

export const uploadTeamTemplate = async ({
  file, thumbnail, name, description, teamId, cancelToken, onUploadProgress,
}) => {
  const uploadFiles = [
    {
      type: 'template',
      file,
    },
    thumbnail && {
      type: 'thumbnail',
      file: thumbnail,
    },
  ].filter(Boolean);
  const res = await clientUpload({
    mutation: UPLOAD_TEAM_TEMPLATE,
    variables: {
      files: uploadFiles,
      input: {
        name,
        description,
        teamId,
      },
    },
    cancelToken,
    onUploadProgress,
  });

  const { errors } = res.data;
  if (errors && errors.length) {
    throw errorUtils.deriveAxiosGraphToHttpError(errors[0]);
  }
  return res.data.data.uploadTeamTemplate;
};

export const uploadOrganizationTemplate = async ({
  file, thumbnail, name, description, orgId, cancelToken, onUploadProgress, isNotify,
}) => {
  const uploadFiles = [
    {
      type: 'template',
      file,
    },
    thumbnail && {
      type: 'thumbnail',
      file: thumbnail,
    },
  ].filter(Boolean);
  const res = await clientUpload({
    mutation: UPLOAD_ORGANIZATION_TEMPLATE,
    variables: {
      files: uploadFiles,
      input: {
        name,
        description,
        orgId,
        isNotify,
      },
    },
    cancelToken,
    onUploadProgress,
  });

  const { errors } = res.data;
  if (errors && errors.length) {
    throw errorUtils.deriveAxiosGraphToHttpError(errors[0]);
  }
  return res.data.data.uploadOrganizationTemplate;
};

export async function useTemplate({ templateId, notify }) {
  const res = await client.mutate({
    mutation: USE_TEMPLATE,
    variables: {
      templateId,
      notify,
    },
  });
  return res.data.createDocumentFromTemplate;
}

export async function deleteTemplate(input) {
  const res = await client.mutate({
    mutation: DELETE_TEMPLATE,
    variables: {
      input,
    },
  });
  return res.data.deleteTemplate;
}

export async function editTemplate({ template, thumbnailFile }) {
  const {
    templateId,
    name,
    description,
    isRemoveThumbnail,
  } = template;
  const payload = {
    mutation: EDIT_TEMPLATE,
    variables: {
      input: {
        templateId,
        name,
        description,
        isRemoveThumbnail,
      },
    },
  };

  if (thumbnailFile) {
    payload.variables.file = thumbnailFile;
    const res = await clientUpload(payload);
    return res.data.data.editTemplate;
  }

  const res = await client.mutate(payload);
  return res.data.editTemplate;
}

export async function createTemplateBaseOnDocument({
  documentId, destinationId, destinationType, templateData, files, isNotify, isRemoveThumbnail,
}) {
  const { name, description } = templateData;
  const payload = {
    mutation: CREATE_TEMPLATE_BASE_ON_DOCUMENT,
    variables: {
      input: {
        documentId,
        destinationId,
        destinationType,
        templateData: {
          name,
          description,
        },
        isNotify,
        isRemoveThumbnail,
      },
    },
  };

  if (files.length > 0) {
    payload.variables.files = files;
    const res = await clientUpload(payload);
    return res.data.data.createTemplateBaseOnDocument;
  }

  const res = await client.mutate(payload);
  return res.data.createTemplateBaseOnDocument;
}

export async function checkReachDailyTemplateUploadLimit({ uploaderId, refId }) {
  const res = await client.query({
    query: CHECK_REACH_DAILY_TEMPLATE_UPLOAD_LIMIT,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      uploaderId,
      refId,
    },
  });
  return res.data.checkReachDailyTemplateUploadLimit;
}

export async function uploadDocumentTemplateToPersonal({ orgId, fileName, encodedUploadData }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENT_TEMPLATE_TO_PERSONAL,
    variables: {
      input: { orgId, fileName, encodedUploadData },
    },
  });
  return res.data.data.uploadDocumentTemplateToPersonal;
}

export async function uploadDocumentTemplateToOrgTeam({ teamId, fileName, encodedUploadData }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENT_TEMPLATE_TO_ORG_TEAM,
    variables: {
      input: { teamId, fileName, encodedUploadData },
    },
  });
  return res.data.data.uploadDocumentTemplateToOrgTeam;
}

export async function uploadDocumentTemplateToOrganization({ orgId, fileName, encodedUploadData }) {
  const res = await clientUpload({
    mutation: UPLOAD_DOCUMENT_TEMPLATE_TO_ORGANIZATION,
    variables: {
      input: { orgId, fileName, encodedUploadData },
    },
  });
  return res.data.data.uploadDocumentTemplateToOrganization;
}

export async function createDocumentFromDocumentTemplate({ documentId, destinationId }) {
  const res = await client.mutate({
    mutation: CREATE_DOCUMENT_FROM_DOCUMENT_TEMPLATE,
    variables: {
      input: {
        documentId,
        destinationId,
      },
    },
  });
  return res.data.createDocumentFromDocumentTemplate;
}

export async function deleteDocumentTemplate(input) {
  const res = await client.mutate({
    mutation: DELETE_DOCUMENT_TEMPLATE,
    variables: {
      input,
    },
  });
  return res.data.deleteDocumentTemplate;
}
