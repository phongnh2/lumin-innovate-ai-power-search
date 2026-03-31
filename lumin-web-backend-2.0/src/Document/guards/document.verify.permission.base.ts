import { ErrorCode } from 'Common/constants/ErrorCode';
import { GraphqlException } from 'Common/errors/graphql/GraphException';
import { CustomHttpException } from 'Common/errors/http/CustomHttpException';

import { DocumentRoleEnum } from 'Document/document.enum';
import { DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION } from 'Document/documentConstant';
import { IndividualRoles } from 'Document/enums/individual.roles.enum';
import { OrganizationRoles, OrganizationDocumentRoles, OrgTeamDocumentRoles } from 'Document/enums/organization.roles.enum';
import { TeamRoles } from 'Document/enums/team.roles.enum';
import { IRequestData } from 'Document/guards/request.data.interface';
import { OrganizationTeamRoles } from 'Organization/organization.enum';

interface IVerifyInput {
    requestData: IRequestData | IRequestData[];
    permissions: string[];
}

interface IVerifyData {
    documentService: any;
    organizationService: any;
    membershipService: any;
    nextFunc: () => any;
    errorCallback: (type?: string) => GraphqlException | CustomHttpException | Error;
    notFoundError?: GraphqlException | CustomHttpException | Error;
    data: IVerifyInput;
}

export enum ValidationStrategy {
  SINGLE_DOCUMENT,
  MULTIPLE_DOCUMENT,
}

function verifyGuestPermission({ document, permissions }): boolean {
  if (document.shareSetting?.linkType === 'ANYONE') {
    const sharePermission = document.shareSetting?.permission.toLowerCase();
    const interceptPermission = sharePermission === IndividualRoles.SHARER ? IndividualRoles.EDITOR : sharePermission;
    if (permissions.includes(IndividualRoles.ALL) || permissions.includes(interceptPermission)) return true;
  }
  return false;
}

function verifyPersonalPermission({ documentPermission, permissions }): boolean {
  return (permissions.includes(IndividualRoles.ALL)
  || documentPermission.role === IndividualRoles.OWNER
  || permissions.includes(documentPermission.role));
}

function verifyTeamPermission({ membership, permissions }): boolean {
  return permissions.includes(TeamRoles.ALL)
  || permissions.includes(membership.role);
}

function verifyOrganizationPermission(params: {
   orgMembershipRole: OrganizationRoles, permissions: any[], roleOfMemberOnDocument: DocumentRoleEnum, isOwnerDocument?: boolean
   }): boolean {
  const {
    orgMembershipRole, permissions, isOwnerDocument, roleOfMemberOnDocument,
  } = params;
  return permissions.includes(OrganizationDocumentRoles.ALL)
  || [OrganizationRoles.ORGANIZATION_ADMIN, OrganizationRoles.BILLING_MODERATOR].includes(orgMembershipRole)
  || isOwnerDocument && permissions.includes(OrganizationDocumentRoles.OWNER)
  || permissions.includes(`organization_${roleOfMemberOnDocument}`);
}

function verifyOrgTeamPermission(params: {
  membershipRole: OrganizationTeamRoles, permissions: any[], isOwnerDocument?: boolean, documentRole?: DocumentRoleEnum
}): boolean {
  const {
    membershipRole, permissions, isOwnerDocument, documentRole,
  } = params;
  return permissions.includes(OrgTeamDocumentRoles.ALL)
  || isOwnerDocument && permissions.includes(OrgTeamDocumentRoles.OWNER)
  || membershipRole === OrganizationTeamRoles.ADMIN
  || documentRole && permissions.includes(`org_team_${documentRole}`);
}
export class VerifyDocumentPermissionBase {
  static async Guest(verifyData: IVerifyData, strategy: ValidationStrategy = ValidationStrategy.SINGLE_DOCUMENT): Promise<boolean> {
    const {
      data, errorCallback, documentService, nextFunc,
    } = verifyData;
    const { requestData, permissions } = data;
    switch (strategy) {
      case ValidationStrategy.SINGLE_DOCUMENT: {
        const { documentId } = requestData as IRequestData;
        if (!documentId) return nextFunc();
        const document = await documentService.getDocumentByDocumentId(documentId);
        if (document) {
          return verifyGuestPermission({ document, permissions }) || nextFunc();
        }
        throw errorCallback(ErrorCode.Document.DOCUMENT_NOT_FOUND);
      }

      case ValidationStrategy.MULTIPLE_DOCUMENT: {
        const documentIds = (requestData as IRequestData[]).map((reqData) => reqData.documentId);
        if (!documentIds.length) return nextFunc();
        const documents = await documentService.findDocumentsByIds(documentIds);
        if (documents) {
          const validationResult = documents.every((document) => verifyGuestPermission({ document, permissions }));

          return validationResult || nextFunc();
        }
      }
        break;
      default:
        break;
    }

    throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
  }

  static async Personal(verifyData: IVerifyData, strategy: ValidationStrategy = ValidationStrategy.SINGLE_DOCUMENT): Promise<boolean> {
    const {
      data, errorCallback, documentService, nextFunc,
    } = verifyData;
    const { requestData, permissions } = data;
    switch (strategy) {
      case ValidationStrategy.SINGLE_DOCUMENT: {
        const { clientId, _id, documentId } = requestData as IRequestData;
        if (clientId && clientId !== _id) return nextFunc();
        const documentPermission = await documentService.getOneDocumentPermission(_id, { documentId });
        return (documentPermission && verifyPersonalPermission({ documentPermission, permissions })) || nextFunc();
      }

      case ValidationStrategy.MULTIPLE_DOCUMENT: {
        const { clientId, _id } = requestData[0];
        if (clientId && clientId !== _id) return nextFunc();
        const documentIds = (requestData as IRequestData[]).map((reqData) => reqData.documentId);
        const documentPermissions = await documentService.getDocumentPermissionByConditions({ refId: _id, documentId: { $in: documentIds } });

        if (documentPermissions?.length) {
          if (documentPermissions.length !== documentIds.length) {
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }
          return documentPermissions.every((documentPermission) => verifyPersonalPermission({ documentPermission, permissions }));
        }
      }
        break;
      default:
        break;
    }

    return nextFunc();
  }

  static async Team(verifyData: IVerifyData, strategy: ValidationStrategy = ValidationStrategy.SINGLE_DOCUMENT): Promise<boolean> {
    const {
      data, errorCallback, documentService, membershipService, nextFunc,
    } = verifyData;
    switch (strategy) {
      case ValidationStrategy.SINGLE_DOCUMENT: {
        const { requestData, permissions } = data;
        const { clientId, _id, documentId } = requestData as IRequestData;
        const document = await documentService.getDocumentByDocumentId(documentId);
        const isOwnerDocument = document?.ownerId.toHexString() === _id;
        if (!clientId || clientId === _id) {
          if (documentId) {
            const documentPermission = await documentService.getTeamOwnerDocumentPermission(documentId);
            if (documentPermission) {
              const membership = await membershipService.findOne({ teamId: documentPermission.refId, userId: _id });
              if (documentPermission.role === DocumentRoleEnum.TEAM) {
                return (membership && verifyTeamPermission({ membership, permissions })) || nextFunc();
              }
              if (documentPermission.role === DocumentRoleEnum.ORGANIZATION_TEAM) {
                const roleOfMemberOnDocument = documentService.getTeamMemberDocumentPermission({
                  documentPermission, role: membership?.role, userId: _id, documentOwnerId: document.ownerId,
                });
                return (membership && verifyOrgTeamPermission({
                  membershipRole: membership.role,
                  permissions,
                  documentRole: roleOfMemberOnDocument,
                  isOwnerDocument,
                })) || nextFunc();
              }
            }
            return nextFunc();
          }
          return true;
        }
        let documentPermissions;
        if (documentId) {
          documentPermissions = await documentService.getDocumentPermissionsByDocId(
            documentId,
            { role: { $in: [DocumentRoleEnum.TEAM, DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.OWNER] } },
          );
          const hasPermission = documentPermissions.length
            && (documentPermissions[0].refId.toString() === clientId || documentPermissions[0].refId.toString() === _id);

          if (!hasPermission) return nextFunc();
        }
        const membership = await membershipService.findOne({ teamId: clientId, userId: _id });

        // TODO
        switch (documentPermissions[0].role) {
          case DocumentRoleEnum.OWNER:
          case DocumentRoleEnum.ORGANIZATION_TEAM: {
            const roleOfMemberOnDocument = documentService.getTeamMemberDocumentPermission({
              documentPermission: documentPermissions[0], role: membership?.role, userId: _id, documentOwnerId: document.ownerId,
            });
            return (membership && verifyOrgTeamPermission({
              membershipRole: membership.role, permissions, documentRole: roleOfMemberOnDocument, isOwnerDocument,
            })) || nextFunc();
          }
          default:
            break;
        }
        nextFunc();
        break;
      }

      case ValidationStrategy.MULTIPLE_DOCUMENT: {
        const { requestData, permissions } = data;
        const { clientId, _id } = requestData[0];
        const documentIds = (requestData as IRequestData[]).map((reqData) => reqData.documentId);

        if (!clientId || clientId === _id) {
          if (documentIds) {
            const documentPermissions = await documentService.getDocumentPermissionByConditions(
              { documentId: { $in: documentIds }, role: { $in: [DocumentRoleEnum.TEAM, DocumentRoleEnum.ORGANIZATION_TEAM] } },
            );
            if (documentPermissions?.length) {
              if (documentPermissions.length !== documentIds.length) {
                throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
              }
              const membership = await membershipService.findOne({ teamId: documentPermissions[0].refId, userId: _id });
              if (documentPermissions[0].role === DocumentRoleEnum.TEAM) {
                return (membership && verifyTeamPermission({ membership, permissions })) || nextFunc();
              }
              if (documentPermissions[0].role === DocumentRoleEnum.ORGANIZATION_TEAM) {
                return (membership && verifyOrgTeamPermission({
                  membershipRole: membership.role, permissions,
                })) || nextFunc();
              }
            }
            return nextFunc();
          }
          return true;
        }
        let documentPermissions;
        if (documentIds) {
          documentPermissions = await documentService.getDocumentPermissionByConditions(
            { refId: clientId, documentId: { $in: documentIds }, role: { $in: [DocumentRoleEnum.TEAM, DocumentRoleEnum.ORGANIZATION_TEAM] } },
          );

          if (!documentPermissions.length) return nextFunc();
          if (documentPermissions.length !== documentIds.length) {
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }
        }
        const membership = await membershipService.findOne({ teamId: clientId, userId: _id });

        if (documentPermissions[0].role === DocumentRoleEnum.TEAM) {
          return (membership && verifyTeamPermission({ membership, permissions })) || nextFunc();
        }
        if (documentPermissions[0].role === DocumentRoleEnum.ORGANIZATION_TEAM) {
          return (membership && verifyOrgTeamPermission({
            membershipRole: membership.role, permissions,
          })) || nextFunc();
        }
        break;
      }
      default:
        break;
    }

    return nextFunc();
  }

  static async Organization(verifyData: IVerifyData, strategy: ValidationStrategy = ValidationStrategy.SINGLE_DOCUMENT): Promise<boolean> {
    const {
      data, errorCallback, documentService, organizationService,
    } = verifyData;
    switch (strategy) {
      case ValidationStrategy.SINGLE_DOCUMENT: {
        const { requestData, permissions } = data;
        const { clientId, _id: userId, documentId } = requestData as IRequestData;
        const document = await documentService.getDocumentByDocumentId(documentId);
        const isOwnerDocument = document?.ownerId.toHexString() === userId;
        let roleOfMemberOnDocument: DocumentRoleEnum;
        if (!clientId || clientId === userId) {
          if (documentId) {
            const documentPermission = await documentService.getOrganizationOwnerDocumentPermission(
              { documentId, role: DocumentRoleEnum.ORGANIZATION },
            );
            if (documentPermission) {
              const orgMembership = await organizationService.getMembershipByOrgAndUser(documentPermission.refId, userId, { role: 1 });
              roleOfMemberOnDocument = documentService.getOrgMemberDocumentPermission({
                documentPermission, role: orgMembership?.role, userId, documentOwnerId: document.ownerId,
              });
              if (orgMembership) {
                if (verifyOrganizationPermission(
                  {
                    orgMembershipRole: orgMembership.role, roleOfMemberOnDocument, permissions, isOwnerDocument,
                  },
                )) return true;

                if (permissions.includes(OrganizationDocumentRoles.OWNER)
                && (await documentService.getDocumentByDocumentId(documentId, { ownerId: 1 })).ownerId.toHexString() === userId) {
                  return true;
                }
              }
            }
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }
          return true;
        }

        const orgMembership = await organizationService.getMembershipByOrgAndUser(clientId, userId, { role: 1 });
        if (documentId) {
          const documentPermissions = await documentService.getDocumentPermissionsByDocId(documentId);
          const hasPermission = documentPermissions.find(
            (permission) => (permission.role === 'organization'
              && permission.refId.toString() === clientId)
              || permission.refId.toString() === userId,
          );
          if (!hasPermission) {
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }
          roleOfMemberOnDocument = documentService.getOrgMemberDocumentPermission({
            documentPermission: hasPermission, role: orgMembership?.role, userId, documentOwnerId: document.ownerId,
          });
        }
        if (orgMembership) {
          if (verifyOrganizationPermission(
            {
              orgMembershipRole: orgMembership.role, roleOfMemberOnDocument, permissions, isOwnerDocument,
            },
          )) return true;

          if (permissions.includes(OrganizationDocumentRoles.OWNER)
          && (await documentService.getDocumentByDocumentId(documentId, { ownerId: 1 })).ownerId.toHexString() === userId) {
            return true;
          }
        }
      }
        break;

      case ValidationStrategy.MULTIPLE_DOCUMENT: {
        const { requestData, permissions } = data;
        const { clientId, _id: userId } = requestData[0];
        const documentIds = (requestData as IRequestData[]).map((reqData) => reqData.documentId);
        let roleOfMemberOnDocument: DocumentRoleEnum;
        const documents = await documentService.findDocumentsByIds(documentIds);
        const userOwnAllDocuments = documents.every(({ ownerId }) => ownerId.toHexString() === userId);

        if (!clientId || clientId === userId) {
          if (documentIds) {
            const documentPermissions = await documentService.getDocumentPermissionByConditions(
              { documentId: { $in: documentIds }, role: 'organization' },
            );
            if (documentPermissions?.length) {
              if (documentPermissions.length !== documentIds.length) {
                throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
              }
              const singleDocumentPermission = documentPermissions[0];
              const orgMembership = await organizationService.getMembershipByOrgAndUser(singleDocumentPermission.refId, userId, { role: 1 });

              roleOfMemberOnDocument = singleDocumentPermission?.groupPermissions?.[userId]
                || singleDocumentPermission?.defaultPermission?.member
                || DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION;
              if (orgMembership
                && verifyOrganizationPermission(
                  {
                    orgMembershipRole: orgMembership.role,
                    roleOfMemberOnDocument,
                    permissions,
                    isOwnerDocument: userOwnAllDocuments,
                  },
                )) return true;
            }
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }
          return true;
        }
        if (documentIds) {
          const documentPermissions = await documentService.getDocumentPermissionByConditions(
            { refId: clientId, documentId: { $in: documentIds }, role: 'organization' },
          );

          if (!documentPermissions.length || (documentPermissions.length !== documentIds.length)) {
            throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
          }

          roleOfMemberOnDocument = documentPermissions[0]?.groupPermissions?.[userId]
            || documentPermissions[0]?.defaultPermission?.member
            || DEFAULT_ORG_MEMBER_DOCUMENT_PERMISSION;
        }

        const orgMembership = await organizationService.getMembershipByOrgAndUser(clientId, userId, { role: 1 });

        if (orgMembership
          && verifyOrganizationPermission(
            {
              orgMembershipRole: orgMembership.role,
              roleOfMemberOnDocument,
              permissions,
              isOwnerDocument: userOwnAllDocuments,
            },
          )) return true;
      }
        break;
      default:
        break;
    }

    throw errorCallback(ErrorCode.Document.NO_DOCUMENT_PERMISSION);
  }
}
