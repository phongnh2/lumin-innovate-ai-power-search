import { gql } from '@apollo/client';

import { Document, PremiumToolsInfo } from './fragments/Document';
import { DocumentData } from './fragments/DocumentBase';
import { OrganizationBase, OrganizationSettingData } from './fragments/OrganizationBase';
import { OrganizationData } from './fragments/OrganizationData';
import { RemainingPlanData } from './fragments/RemainingPlan';
import { DocumentTemplateData } from './fragments/Template';

const UserNewNotificationsData = gql`
  fragment UserNewNotificationsData on User {
    notificationStatus {
      general {
        hasNewNoti
        unreadCount
      }
      invites {
        hasNewNoti
        unreadCount
      }
      requests {
        hasNewNoti
        unreadCount
      }
    }
  }
`;

const TenantConfigurationWithDomain = gql`
  fragment TenantConfigurationWithDomain on User {
    allTenantConfigurations {
      domain
      configuration {
        organization {
          allowOrgCreation
        }
        collaboration {
          inviteScope
        }
        collaboration {
          inviteScope
        }
        files {
          service
          templateManagementEnabled
        }
        ui {
          hideAiChatbot
          hidePromptDriveUsersBanner
        }
      }
    }
  }
`;

const OrganizationInviteLinkData = gql`
  fragment OrganizationInviteLinkData on OrganizationInviteLink {
    _id
    inviteId
    orgId
    role
    actorId
    expiresAt
    createdAt
    isExpiringSoon
    isExpired
  }
`;

const FolderTreeData = gql`
  fragment FolderTreeData on FolderChildrenTree {
    _id
    name
    type
  }
`;

const FolderDataDetail = gql`
  fragment FolderDataDetail on Folder {
    _id
    ownerId
    ownerName
    name
    path
    depth
    createdAt
    color
    listUserStar
    totalDocument
    belongsTo {
      type
      location {
        _id
        name
      }
      workspaceId
    }
    breadcrumbs {
      _id
      name
    }
  }
`;

const fragments = {
  UserData: gql`
    fragment UserData on User {
      _id
      isNotify
      ...UserNewNotificationsData
      email
      name
      avatarRemoteId
      lastLogin
      isUsingPassword
      isPopularDomain
      hasJoinedOrg
      migratedOrgUrl
      payment {
        type
        period
        status
        currency
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        priceVersion
        stripeAccountId
      }
      setting {
        marketingEmail
        subscriptionEmail
        otherEmail
        featureUpdateEmail
        dataCollection
        documentEmail {
          shareDocument
          commentDocument
          replyCommentDocument
          mentionCommentDocument
          requestAccessDocument
        }
        organizationEmail {
          inviteToOrganization
          inviteToOrganizationTeam
        }
        defaultWorkspace
      }
      signatures
      createdAt
      deletedAt
      type
      metadata {
        hasShownBananaBanner
        hasShownAutoSyncModal
        rating {
          googleModalStatus
        }
        folderColors
        numberCreatedOrg
        hasInformedMyDocumentUpload
        ratedApp
        hasShownContentEditPopover
        hasShownEditFileOfflinePopover
        hasShownAutoSyncDefault
        docSummarizationConsentGranted
        formFieldDetectionConsentGranted
        introduceNewLayout
        isHiddenSuggestedOrganization
        isUsingNewLayout
        introduceNewInAppLayout
        exploredFeatures {
          editPdf
          formBuilder
          ocr
          summarization
          splitPdf
          redactPdf
          protectPdf
        }
        chatbotFreeRequests
        hasShownEditInAgreementGenModal
        hasClosedQuickSearchGuideline
        acceptedTermsOfUseVersion
      }
      lastAccessedOrgUrl
      loginService
      reachUploadDocLimit
      hasNewVersion
      isOneDriveAddInsWhitelisted
      isOneDriveFilePickerWhitelisted
      toolQuota {
        formFieldDetection {
          usage
          blockTime
          isExceeded
        }
        autoDetection {
          usage
          blockTime
          isExceeded
        }
        formFieldDetection {
          usage
          blockTime
          isExceeded
        }
      }
      isTermsOfUseVersionChanged
      ...TenantConfigurationWithDomain
      hashedIpAddress
    }
    ${TenantConfigurationWithDomain}
    ${UserNewNotificationsData}
  `,
  BasicResponseData: gql`
    fragment BasicResponseData on BasicResponse {
      message
      statusCode
    }
  `,
  BasicResponseWithEmailData: gql`
    fragment BasicResponseWithEmailData on BasicResponseData {
      message
      statusCode
      data
    }
  `,
  NotificationData: gql`
    fragment NotificationData on Notification {
      _id
      actor {
        id
        name
        type
        avatarRemoteId
        actorData
      }
      is_read
      entity {
        id
        name
        type
        avatarRemoteId
        entityData
      }
      target {
        targetId
        targetName
        type
        targetData
      }
      notificationType
      actionType
      createdAt
      tab
    }
  `,
  BasicOrganizationData: OrganizationBase,
  OrganizationData,
  DocumentData,
  DocumentTemplateData,
  DocumentViewerData: Document,
  WidgetNotificationData: gql`
    fragment WidgetNotificationData on WidgetNotification {
      _id
      userId
      type
      createdAt
      isPreviewed
      isRead
      isNewWidget
    }
  `,
  TeamData: gql`
    fragment TeamData on Team {
      _id
      name
      avatarRemoteId
      createdAt
      belongsTo {
        targetId
        type
      }
      roleOfUser
      totalMembers
      members(options: { limit: 6 }) {
        _id
        name
        email
        avatarRemoteId
      }
      owner {
        _id
        name
        email
        avatarRemoteId
      }
      settings {
        templateWorkspace
      }
    }
  `,
  FolderData: gql`
    fragment FolderData on Folder {
      _id
      ownerId
      ownerName
      name
      path
      depth
      createdAt
      color
      listUserStar
      belongsTo {
        type
        location {
          _id
          name
        }
        workspaceId
      }
      breadcrumbs {
        _id
        name
      }
    }
  `,
  TemplateData: gql`
    fragment TemplateData on Template {
      _id
      name
      size
      remoteId
      thumbnail
      ownerId
      description
      ownerName
      createdAt
      counter {
        view
        download
      }
      belongsTo {
        type
        location {
          _id
          name
        }
      }
      permissions {
        canEdit
        canDelete
      }
      lastModify
    }
  `,
  UserNewNotificationsData,
  OrganizationSettingData,
  RemainingPlanData,
  PremiumToolsInfo,
  RubberStampData: gql`
    fragment RubberStampData on UserAnnotation {
      _id
      property {
        title
        font
        subtitle
        textColor
        color
        bold
        underline
        strikeout
        italic
        author
        dateFormat
        timeFormat
      }
    }
  `,
  OrganizationInviteLinkData,
  FolderTreeData,
  FolderDataDetail,
};

export default fragments;
