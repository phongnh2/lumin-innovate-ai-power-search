import {
  DeleteMessageCommand, Message, ReceiveMessageCommand, SQSClient,
} from '@aws-sdk/client-sqs';
import {
  Inject, Injectable, OnModuleDestroy, OnModuleInit,
} from '@nestjs/common';
import { Identity } from '@ory/client';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { MAXIMUM_AVATAR_SIZE } from 'Common/constants/UserAvatarConstants';

import { AwsService } from 'Aws/aws.service';

import { AuthService } from 'Auth/auth.service';
import { USER_VERSION } from 'constant';
import { DocumentService } from 'Document/document.service';
import { EnvironmentService } from 'Environment/environment.service';
import { LoginService, OrganizationRoleInvite } from 'graphql.schema';
import { KratosService } from 'Kratos/kratos.service';
import { LoggerService } from 'Logger/Logger.service';
import { LuminContractService } from 'LuminContract/luminContract.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { User } from 'User/interfaces/user.interface';
import { UserOrigin } from 'User/user.enum';
import { UserService } from 'User/user.service';

import { ScimMessage, ScimMessageName } from './interfaces/scim.interface';

@Injectable()
export class ScimConsumerService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;

  constructor(
    @Inject('SQS_CLIENT')
    private readonly sqsClient: SQSClient,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
    private readonly kratosService: KratosService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly luminContractService: LuminContractService,
    private readonly documentService: DocumentService,
    private readonly awsService: AwsService,
  ) {}

  onModuleInit() {
    if (this.sqsClient) {
      this.loggerService.info({
        context: this.onModuleInit.name,
        message: 'Starting SQS consumer...',
      });
      this.isRunning = true;
      this.pollQueue();
    }
  }

  onModuleDestroy() {
    this.loggerService.info({
      context: this.onModuleDestroy.name,
      message: 'Stopping SQS consumer...',
    });
    this.isRunning = false;
  }

  private async pollQueue() {
    const queueUrl = this.environmentService.getByKey(EnvConstants.AWS_SQS_QUEUE_URL);
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10, // You can adjust this value
      WaitTimeSeconds: 20, // Enable long polling
    };

    const pollOnce = async (): Promise<void> => {
      try {
        const command = new ReceiveMessageCommand(params);
        const { Messages } = await this.sqsClient.send(command);

        if (Messages && Messages.length > 0) {
          // Process messages in parallel
          const messagePromises = Messages.map((message) => this.processMessage(message, queueUrl));
          await Promise.all(messagePromises);
        }
      } catch (error) {
        this.loggerService.error({
          context: 'ScimConsumerService.pollQueue',
          message: 'Error receiving messages from SQS:',
          error: error.message,
          extraInfo: {
            queueUrl,
          },
        });
      }
    };

    const pollContinuously = async () => {
      if (!this.isRunning) {
        return;
      }
      await pollOnce();
      setImmediate(pollContinuously);
    };
    await pollContinuously();
  }

  private async processMessage(message: Message, queueUrl: string) {
    try {
      const scimMessage = JSON.parse(message.Body) as ScimMessage;

      if (scimMessage.projectId !== this.environmentService.getByKey(EnvConstants.ORY_PROJECT_ID)) {
        return;
      }

      switch (scimMessage.name as ScimMessageName) {
        case ScimMessageName.IdentityCreated:
          await this.handleCreateUser(scimMessage);
          break;
        case ScimMessageName.IdentityUpdated:
          await this.handleUpdateUser(scimMessage);
          break;
        default:
          break;
      }

      // After successful processing, delete the message from the queue
      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      });
      await this.sqsClient.send(deleteCommand);
    } catch (error) {
      this.loggerService.error({
        context: this.processMessage.name,
        message: `Error processing or deleting message ${message.MessageId}:`,
        error: error.message,
        extraInfo: {
          messageId: message.MessageId,
        },
      });
    }
  }

  private async getCommonScimInfo({ identityId, scimClientId } : { identityId: string; scimClientId: string }): Promise<{
    organization?: IOrganization;
    oryIdentity?: Identity;
  }> {
    // find organization by scim client
    const organization = await this.organizationService.getOrganizationByScimClient(scimClientId);
    if (!organization) {
      return {};
    }

    // get user information from Ory Network
    const oryIdentity = await this.kratosService.getIdentityById(identityId);
    if (!oryIdentity) {
      return {};
    }

    return { organization, oryIdentity };
  }

  private async handleCreateUser(scimMessage: ScimMessage): Promise<void> {
    const { IdentityID: identityId, SCIMClient: scimClientId } = scimMessage.eventAttributes;

    const { organization, oryIdentity } = await this.getCommonScimInfo({ identityId, scimClientId });
    if (!organization || !oryIdentity) {
      return;
    }

    // check user email already exists in internal system
    const isUserExists = await this.userService.existsUserEmail(oryIdentity.traits.email as string);
    if (isUserExists) {
      return;
    }
    // TODO-toan: check user email banned

    // create user in internal system
    const newUserData = {
      identityId: oryIdentity.id,
      email: oryIdentity.traits.email,
      name: oryIdentity.traits.name,
      isVerified: true,
      loginService: LoginService.SAML_SSO,
      origin: UserOrigin.LUMIN,
      version: USER_VERSION,
    };
    const newUser = await this.userService.createUser(newUserData);

    // add user to organization
    await this.addUserToOrganization(newUser, organization);
  }

  private async fetchImageBlob(identityId: string, url: string): Promise<{
    content: Buffer;
    mimeType: string;
  } | null> {
    const controller = new AbortController();
    try {
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const imageRes = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!imageRes.ok) {
        return null;
      }

      const arrayBuffer = await imageRes.arrayBuffer();
      return {
        content: Buffer.from(arrayBuffer),
        mimeType: imageRes.headers.get('Content-Type') || 'image/jpeg',
      };
    } catch (error) {
      this.loggerService.error({
        context: 'ScimConsumerService.fetchImageBlob',
        error,
        extraInfo: {
          identityId,
          url,
        },
      });
      return null;
    }
  }

  private async handleEmailUpdate(user: User, newEmail: string): Promise<void> {
    const oldEmail = user.email;
    if (oldEmail !== newEmail) {
      // update the user's email
      await this.userService.updateUserByIdentityId(user.identityId, { email: newEmail });

      // emit email changed event
      this.userService.emitUserEmailChanged(user, newEmail);
      this.loggerService.info({
        context: this.handleEmailUpdate.name,
        message: 'User email updated successfully',
        extraInfo: {
          userId: user._id,
        },
      });
    }
  }

  private async handleUpdateUserAttributes(user: User, oryIdentity: Identity): Promise<void> {
    const { identityId } = user;

    // handle email update
    await this.handleEmailUpdate(user, oryIdentity.traits.email as string);

    // update attributes
    // handle profileUrl attribute
    let avatarRemoteId = oryIdentity.traits.avatarRemoteId as string;
    const metadataAdmin = oryIdentity.metadata_admin as { scimProfileUrl: string };
    const scimProfileUrl = metadataAdmin?.scimProfileUrl;
    if (scimProfileUrl) {
      // fetch image from profileUrl
      const profileImage = await this.fetchImageBlob(identityId, scimProfileUrl);
      if (profileImage && profileImage.content.byteLength <= MAXIMUM_AVATAR_SIZE) {
        const avatarRemotePath: string = await this.awsService.uploadUserAvatarWithBuffer(profileImage.content, profileImage.mimeType);
        // remove old avatar
        if (oryIdentity.traits.avatarRemoteId) {
          await this.awsService.removeFileFromBucket(oryIdentity.traits.avatarRemoteId as string, EnvConstants.S3_PROFILES_BUCKET)
            .catch((err) => this.loggerService.error({
              context: this.handleUpdateUserAttributes.name,
              error: JSON.stringify(err),
              extraInfo: { identityId },
            }));
        }

        // update `avatarRemoteId` property for Ory identity
        await this.kratosService.kratosAdmin.patchIdentity({
          id: identityId,
          jsonPatch: [
            {
              op: 'replace',
              path: '/traits/avatarRemoteId',
              value: avatarRemotePath,
            },
            {
              op: 'remove',
              path: '/metadata_admin/scimProfileUrl',
            },
          ],
        });
        avatarRemoteId = avatarRemotePath;
      }
    }

    const updateFields = {
      name: oryIdentity.traits.name,
      avatarRemoteId,
    };
    await this.userService.updateUserByIdentityId(identityId, updateFields);
  }

  private async handleDeleteUser(identityId: string): Promise<void> {
    const { _id: userId } = await this.userService.findUserByIdentityId(identityId, { _id: 1 }) || {};
    if (!userId) {
      return;
    }
    const { error } = await this.authService.deleteAccount({ userId, fromProvisioning: true });
    if (error) {
      this.loggerService.error({
        context: '',
        error,
        extraInfo: {
          userId,
          identityId,
        },
      });
    }
    try {
      await this.luminContractService.deleteAccount({
        userId,
      });
    } catch (_error) {
      this.loggerService.error({
        context: 'luminContractService.deleteAccount',
        error: _error,
        extraInfo: {
          userId,
          identityId,
        },
      });
    }
    try {
      await this.documentService.deleteManyRequestAccess({ requesterId: userId });
    } catch (_error) {
      this.loggerService.error({
        context: 'deleteAccount - documentService.deleteManyRequestAccess',
        extraInfo: {
          userId,
          identityId,
        },
        error: _error,
      });
    }
  }

  private async handleUpdateUser(scimMessage: ScimMessage): Promise<void> {
    const { IdentityID: identityId, IdentityActive, SCIMClient: scimClientId } = scimMessage.eventAttributes;
    const identityActive = IdentityActive === 'true';

    const { organization, oryIdentity } = await this.getCommonScimInfo({ identityId, scimClientId });
    if (!organization || !oryIdentity) {
      return;
    }

    if (identityActive) {
      const user = await this.userService.findUserByIdentityId(identityId, { _id: 1, email: 1, identityId: 1 });
      if (!user) {
        await this.handleCreateUser(scimMessage);
        return;
      }
      await this.handleUpdateUserAttributes(user, oryIdentity);

      // add identity to member's organization if the identity is not in the organization yet
      const membership = await this.organizationService.getMembershipByOrgAndUser(organization._id, user._id);
      if (!membership) {
        await this.addUserToOrganization(user, organization);
      }
    } else {
      await this.handleDeleteUser(identityId);
    }
  }

  private async addUserToOrganization(user: User, organization: IOrganization): Promise<void> {
    const organizationOwner = await this.userService.findUserById(organization.ownerId as string);
    if (!organizationOwner) {
      this.loggerService.warn({
        context: 'ScimConsumerService.addUserToOrganization',
        message: 'Organization owner not found, skipping user invitation',
        extraInfo: {
          organizationId: organization._id,
          userId: user._id,
        },
      });
      return;
    }

    await this.organizationService.inviteMemberToOrganization([{
      email: user.email,
      role: OrganizationRoleInvite.MEMBER,
    }], organization, organizationOwner, false);

    this.loggerService.info({
      context: 'ScimConsumerService.addUserToOrganization',
      message: 'User added to organization via SCIM',
      extraInfo: {
        organizationId: organization._id,
        userId: user._id,
      },
    });
  }
}
