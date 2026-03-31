import { gql } from '@apollo/client';

import { DocumentData } from './DocumentBase';

export const Document = gql`
  fragment DocumentViewerData on Document {
    ...DocumentData
    downloadUrl
    manipulationStep
    bookmarks
    backupInfo {
      createdAt
      restoreOriginalPermission
    }
    metadata {
      hasAppliedOCR
      hasMerged
      hasOutlines
    }
    sharedPermissionInfo {
      type
      total
      organizationName
      teamName
    }
    fromSource
  }
  ${DocumentData}
`;

export const PremiumToolsInfo = gql`
  fragment PremiumToolsInfo on PremiumToolsInfo {
    signedResponse
  }
`;
