import { gql } from '@apollo/client';

import Fragments from './Fragment';

export const GET_PERSONAL_TEMPLATES = gql`
  query getPersonalTemplates($pagingOption: GetTemplatesInput!) {
    getPersonalTemplates(pagingOption: $pagingOption) {
      totalItem
      pageInfo {
        limit
        offset
      }
      edges {
        node {
          ...TemplateData
        }
      }
    }
  }
  ${Fragments.TemplateData}
`;
export const GET_ORGANIZATION_TEMPLATES = gql`
  query getOrganizationTemplates($orgId: ID!, $tab: OrganizationTemplateTabs!, $pagingOption: GetTemplatesInput!) {
    getOrganizationTemplates(orgId: $orgId, tab: $tab, pagingOption: $pagingOption) {
      totalItem
      pageInfo {
        limit
        offset
      }
      edges {
        node {
          ...TemplateData
        }
      }
    }
  }
  ${Fragments.TemplateData}
`;
export const GET_TEAM_TEMPLATES = gql`
  query getTeamTemplates($teamId: ID!, $pagingOption: GetTemplatesInput!) {
    getTeamTemplates(teamId: $teamId, pagingOption: $pagingOption) {
      totalItem
      pageInfo {
        limit
        offset
      }
      edges {
        node {
          ...TemplateData
        }
      }
    }
  }
  ${Fragments.TemplateData}
`;

export const GET_TEMPLATE_BY_ID = gql`
  query getTemplateById($templateId: ID!, $withSignedUrl: Boolean!, $increaseView: Boolean) {
    getTemplateById(templateId: $templateId, increaseView: $increaseView) {
      ...TemplateData
      signedUrl @include(if: $withSignedUrl)
    }
  }
  ${Fragments.TemplateData}
`;

export const UPLOAD_PERSONAL_TEMPLATE = gql`
  mutation ($input: UploadPersonalTemplateInput!, $files: [Upload]!) {
    uploadPersonalTemplate(input: $input, files: $files) {
      ...TemplateData
    }
  }
  ${Fragments.TemplateData}
`;

export const UPLOAD_TEAM_TEMPLATE = gql`
  mutation ($input: UploadTeamTemplateInput!, $files: [Upload]!) {
    uploadTeamTemplate(input: $input, files: $files) {
      ...TemplateData
    }
  }
  ${Fragments.TemplateData}
`;

export const UPLOAD_ORGANIZATION_TEMPLATE = gql`
  mutation ($input: UploadOrganizationTemplateInput!, $files: [Upload]!) {
    uploadOrganizationTemplate(input: $input, files: $files) {
      ...TemplateData
    }
  }
  ${Fragments.TemplateData}
`;

export const USE_TEMPLATE = gql`
  mutation ($templateId: ID!, $notify: Boolean) {
    createDocumentFromTemplate(templateId: $templateId, notify: $notify) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;

export const EDIT_TEMPLATE = gql`
  mutation ($input: EditTemplateInput!, $file: Upload) {
    editTemplate(input: $input, file: $file) {
      ...TemplateData
    }
  }
  ${Fragments.TemplateData}
`;

export const DELETE_TEMPLATE = gql`
  mutation deleteTemplate($input: DeleteTemplateInput!) {
    deleteTemplate(input:$input) {
      message
      statusCode
    }
  } 
`;

export const CREATE_TEMPLATE_BASE_ON_DOCUMENT = gql`
  mutation createTemplateBaseOnDocument($input: CreateTemplateBaseOnDocumentInput!, $files: [Upload]) {
    createTemplateBaseOnDocument(input: $input, files: $files) {
      ...TemplateData
    }
  } 
  ${Fragments.TemplateData}
`;

export const CHECK_REACH_DAILY_TEMPLATE_UPLOAD_LIMIT = gql`
  query checkReachDailyTemplateUploadLimit($uploaderId: ID!, $refId: ID!) {
    checkReachDailyTemplateUploadLimit(uploaderId: $uploaderId, refId: $refId)
  }
`;

export const UPLOAD_DOCUMENT_TEMPLATE_TO_PERSONAL = gql`
  mutation uploadDocumentTemplateToPersonal($input: UploadPersonalDocumentTemplateInput!) {
    uploadDocumentTemplateToPersonal(input: $input) {
      ...DocumentTemplateData
      etag
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          url
        }
      }
    }
  }
  ${Fragments.DocumentTemplateData}
`;

export const UPLOAD_DOCUMENT_TEMPLATE_TO_ORGANIZATION = gql`
  mutation uploadDocumentTemplateToOrganization($input: UploadDocumentTemplateToOrgInput!) {
    uploadDocumentTemplateToOrganization(input: $input) {
      ...DocumentTemplateData
      etag
      belongsTo {
        type
        workspaceId
        location {
          _id
          name
          url
        }
      }
    }
  }
  ${Fragments.DocumentTemplateData}
`;

export const UPLOAD_DOCUMENT_TEMPLATE_TO_ORG_TEAM = gql`
  mutation uploadDocumentTemplateToOrgTeam($input: UploadDocumentTemplateToTeamInput!) {
    uploadDocumentTemplateToOrgTeam(input: $input) {
      ...DocumentTemplateData
    }
  }
  ${Fragments.DocumentTemplateData}
`;

export const CREATE_DOCUMENT_FROM_DOCUMENT_TEMPLATE = gql`
  mutation createDocumentFromDocumentTemplate($input: CreateDocumentFromDocumentTemplateInput!) {
    createDocumentFromDocumentTemplate(input: $input) {
      ...DocumentData
    }
  }
  ${Fragments.DocumentData}
`;
