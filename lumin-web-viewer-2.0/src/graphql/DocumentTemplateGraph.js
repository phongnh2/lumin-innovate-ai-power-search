import { gql } from '@apollo/client';

import Fragments from './Fragment';

const SUB_UPDATE_DOCUMENT_TEMPLATE_LIST = gql`
  subscription updateDocumentTemplateList($input: UpdateDocumentTemplateListInput!) {
    updateDocumentTemplateList(input: $input) {
      document {
        ...DocumentTemplateData
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
      teamId
      organizationId
      clientId
      type
      statusCode
    }
  }
  ${Fragments.DocumentTemplateData}
`;

const SUB_DELETE_DOCUMENT_TEMPLATE = gql`
  subscription deleteDocumentTemplate($clientId: ID!) {
    deleteDocumentTemplate(clientId: $clientId) {
      documentTemplateId
      teamId
      organizationId
      clientId
      type
      statusCode
    }
  }
`;

const DELETE_DOCUMENT_TEMPLATE = gql`
  mutation deleteDocumentTemplate($input: DeleteDocumentTemplateInput!) {
    deleteDocumentTemplate(input: $input) {
      message
      statusCode
    }
  }
`;

export { SUB_UPDATE_DOCUMENT_TEMPLATE_LIST, DELETE_DOCUMENT_TEMPLATE, SUB_DELETE_DOCUMENT_TEMPLATE };
