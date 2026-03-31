import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConversationsListResponse,
  ConversationsMembersResponse,
  PageReducer,
  PaginatePredicate,
  WebClient,
  MessageAttachment,
  AnyBlock,
  ErrorCode,
  WebAPIRequestError,
} from '@slack/web-api';
import { UsersListResponse } from '@slack/web-api/dist/types/response/UsersListResponse';
import { IncomingWebhook } from '@slack/webhook';
import { AxiosError } from 'axios';
import { chunk } from 'lodash';
import * as moment from 'moment';
import { v4 as uuidV4 } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';
import { HttpErrorException } from 'Common/errors/HttpErrorException';

import { IDocument } from 'Document/interfaces';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  InitSlackOAuthResponse, SlackChannel, SlackConversation, SlackConversationType, SlackRecipient, SlackTeam,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import {
  InstallURLOptions, SlackConnectionCredential, SlackOAuthCallbackResponse, SlackOAuthErrorType, SlackOAuthJwtPayload,
  SlackSMBNotificationType,
} from './interfaces/slack.interface';
import { SlackConnectionService } from './slack.connection.service';

@Injectable()
export class SlackService {
  private readonly installAppIntegrationUrl: string;

  private readonly smbIncomingWebhook: IncomingWebhook;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => EventsGateway)) private readonly messageGateway: EventsGateway,
    private readonly slackConnectionService: SlackConnectionService,
  ) {
    this.installAppIntegrationUrl = this.environmentService.getByKey(EnvConstants.SLACK_INSTALL_APP_INTEGRATION_URL);
    const smbWebhookUrl = this.environmentService.getByKey(EnvConstants.SLACK_SMB_WEBHOOK_URL);
    if (smbWebhookUrl) {
      this.smbIncomingWebhook = new IncomingWebhook(smbWebhookUrl);
    }
  }

  // Helper method to check if pagination should stop
  private readonly pageShouldStop: PaginatePredicate = (page) => {
    if (page.response_metadata?.next_cursor) {
      return false;
    }
    return true;
  };

  private createWebClient(token?: string, timeout: number = 10000): WebClient {
    const client = new WebClient(token, {
      timeout,
      retryConfig: {
        retries: 3,
      },
    });

    // Create a proxy to intercept all method calls
    return new Proxy(client, {
      get: (target, prop, receiver) => {
        const originalProperty = Reflect.get(target, prop, receiver);

        if (typeof originalProperty === 'function' && prop !== 'constructor') {
          return async (...args: any[]) => {
            try {
              return await (originalProperty as (...args: any[]) => any).apply(target, args);
            } catch (error) {
              if (error.code === ErrorCode.RequestError) {
                const webAPIRequestError = error as WebAPIRequestError;
                if (webAPIRequestError.original instanceof AxiosError && webAPIRequestError.original.code === 'ECONNABORTED') {
                  this.loggerService.error({
                    context: 'SlackService.WebClient',
                    message: `Slack API call timed out after ${timeout}ms`,
                    error,
                  });
                }
              }
              throw error;
            }
          };
        }

        return originalProperty;
      },
    });
  }

  private async getUserClient(userId: string, teamId: string): Promise<WebClient> {
    const credential = await this.slackConnectionService.getCredential(userId, teamId);
    return this.createWebClient(credential.user.accessToken);
  }

  private async getBotClient(userId: string, teamId: string): Promise<WebClient> {
    const credential = await this.slackConnectionService.getCredential(userId, teamId);
    return this.createWebClient(credential.bot.accessToken);
  }

  initSlackOAuth(user: User): InitSlackOAuthResponse {
    const { _id, email } = user;
    const flowId = uuidV4();
    const tokenPayload: SlackOAuthJwtPayload = {
      flowId,
      userId: _id,
      email,
    };
    const slackOAuthToken = this.jwtService.sign(tokenPayload, {
      expiresIn: Number(CommonConstants.SIGN_IN_SLACK_OAUTH_EXPIRE_IN),
    });
    this.redisService.setSignInSlackOAuthToken(_id, slackOAuthToken);
    return {
      contextJwt: slackOAuthToken,
      flowId,
    };
  }

  async getOAuthRedirectUrl(jwtToken: string): Promise<string> {
    if (!jwtToken) {
      throw HttpErrorException.BadRequest('No JWT token provided');
    }

    try {
      const { userId } = this.jwtService.verify<SlackOAuthJwtPayload>(jwtToken);
      const signInSlackOAuthToken = await this.redisService.getSignInSlackOAuthToken(userId);
      if (!signInSlackOAuthToken) {
        throw new Error('No Slack OAuth token found');
      }
      return this.generateInstallUrl({
        scopes: [
          // integration - bot app
          'channels:join',
          'chat:write', // API: chat.postMessage
          'commands',
          'files:read',
          'im:history',
          'links:read',
          'links:write',
          'remote_files:write',
          // web
          'team:read', // API: team.info
          'users:read', // API: users.info, users.list
          'users:read.email', // API: users.info, users.list
          'chat:write.public', // API: chat.postMessage - public channels
        ],
        userScopes: [
          'channels:read', // API: conversations.list, conversations.members
          'groups:read', // API: conversations.list, conversations.members
          'groups:write.invites', // API: conversations.invite, chat.postMessage
        ],
      }, signInSlackOAuthToken);
    } catch (error) {
      this.loggerService.error({
        context: this.getOAuthRedirectUrl.name,
        error,
      });
      throw HttpErrorException.BadRequest(error instanceof Error ? error.message : 'Failed to generate install URL');
    }
  }

  private generateInstallUrl(options: InstallURLOptions, state: string): string {
    const installUrl = new URL(this.installAppIntegrationUrl);

    if (!options.scopes) {
      throw new Error(`You must provide a scope parameter when calling ${this.generateInstallUrl.name}`);
    }

    const params = new URLSearchParams();

    // scope
    let scopes: string;
    if (Array.isArray(options.scopes)) {
      scopes = options.scopes.join(',');
    } else {
      scopes = options.scopes;
    }
    params.append('scope', scopes);

    // user scope
    if (options.userScopes) {
      let userScopes: string;
      if (Array.isArray(options.userScopes)) {
        userScopes = options.userScopes.join(',');
      } else {
        userScopes = options.userScopes;
      }
      params.append('user_scope', userScopes);
    }

    // state
    params.append('state', state);

    // team id
    if (options.teamId) {
      params.append('team', options.teamId);
    }
    installUrl.search = params.toString();

    return installUrl.toString();
  }

  async handleSlackOAuthCallback(state: string, isCancelled?: boolean): Promise<void> {
    const { flowId, userId, email } = this.jwtService.verify<SlackOAuthJwtPayload>(state, { ignoreExpiration: true });

    let slackOAuthErrorType: SlackOAuthErrorType | null = null;
    let callbackResponse: SlackOAuthCallbackResponse = {
      isOk: true,
      flowId,
    };
    try {
      if (isCancelled) {
        slackOAuthErrorType = SlackOAuthErrorType.CANCELLED_BY_USER;
        throw new Error('User cancelled the Slack OAuth flow');
      }

      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        slackOAuthErrorType = SlackOAuthErrorType.SOMETHING_WENT_WRONG;
        throw new Error('User not found');
      }

      const slackWebAuthorizationContent = await this.redisService.getRedisValueWithKey(RedisConstants.SLACK_WEB_AUTHORIZATION + flowId);
      if (!slackWebAuthorizationContent) {
        slackOAuthErrorType = SlackOAuthErrorType.SOMETHING_WENT_WRONG;
        throw new Error('Not found Slack OAuth token');
      }

      const {
        teamId,
        botUserId,
        botAccessToken,
        botScopes,
        userId: slackUserId,
        userAccessToken,
        userScopes,
      } = JSON.parse(slackWebAuthorizationContent) as {
        teamId: string;
        botUserId: string;
        botAccessToken: string;
        botScopes: string;
        userId: string;
        userAccessToken: string;
        userScopes: string;
      };

      const webClient = this.createWebClient(botAccessToken);

      // logic 1:1 - check match email between Lumin and Slack
      const slackUser = await webClient.users.info({ user: slackUserId });
      const slackOAuthEmailWhitelist = this.environmentService.getByKey(EnvConstants.SLACK_OAUTH_EMAIL_WHITELIST) || [];
      if (!slackUser.ok || (slackUser.user?.profile?.email !== email && !slackOAuthEmailWhitelist.includes(email))) {
        // revoke token
        const hasSlackUserConnection = await this.slackConnectionService.hasSlackUserConnection(teamId, slackUserId);
        if (!hasSlackUserConnection) {
          this.revokeToken(botAccessToken, 'bot', teamId);
          this.revokeToken(userAccessToken, 'user', teamId);
        }
        slackOAuthErrorType = SlackOAuthErrorType.DIFFERENT_EMAIL_ADDRESS;
        throw new Error('Authenticated email does not match with the Lumin user email');
      }

      const credential: SlackConnectionCredential = {
        bot: {
          accessToken: botAccessToken,
          scope: botScopes,
          userId: botUserId,
        },
        user: {
          accessToken: userAccessToken,
          scope: userScopes,
          userId: slackUserId,
        },
      };
      await this.slackConnectionService.addSlackConnection({
        userId: user._id,
        slackTeamId: teamId,
        slackUserId,
        credential: JSON.stringify(credential),
      });

      callbackResponse.teamId = teamId;

      // delete the slack web authorization from redis
      this.redisService.deleteRedisByKey(RedisConstants.SLACK_WEB_AUTHORIZATION + flowId);
    } catch (error) {
      this.loggerService.error({
        context: this.handleSlackOAuthCallback.name,
        error,
        message: error.message,
        extraInfo: {
          userId,
          flowId,
        },
      });
      callbackResponse = {
        isOk: false,
        flowId,
        errorType: slackOAuthErrorType,
      };
    } finally {
      this.redisService.removeSignInSlackOAuthToken(userId);
      this.messageGateway.server
        .to(SocketRoomGetter.user(userId))
        .emit(SOCKET_MESSAGE.SLACK_OAUTH_FLOW_COMPLETED, callbackResponse);
    }
  }

  async getSlackTeams(userId: string): Promise<SlackTeam[]> {
    const slackConnections = await this.slackConnectionService.getSlackConnections(userId);
    if (!slackConnections || slackConnections.length === 0) {
      return [];
    }

    const slackTeamIds = slackConnections.map((connection) => connection.slackTeamId);
    const validSlackTeamIds = (await Promise.all(
      slackTeamIds.map((slackTeamId) => this.testSlackConnection(userId, slackTeamId)),
    )).reduce((acc, isValid, index) => {
      if (isValid) {
        acc.push(slackTeamIds[index]);
      }
      return acc;
    }, [] as string[]);

    const teams = await Promise.all(validSlackTeamIds.map(async (slackTeamId) => {
      const webClient = await this.getBotClient(userId, slackTeamId);
      const resp = await webClient.team.info({
        team: slackTeamId,
      });
      if (!resp.ok) {
        return null;
      }
      return {
        id: slackTeamId,
        name: resp.team.name,
        domain: resp.team.domain,
        avatar: resp.team.icon.image_88,
      };
    }));
    return teams.filter(Boolean);
  }

  async getSlackChannels(userId: string, teamId: string): Promise<SlackChannel[]> {
    const webClient = await this.getUserClient(userId, teamId);

    const pageReducer: PageReducer<SlackChannel[]> = (accumulator, page) => {
      const resp = page as ConversationsListResponse;
      const validChannels = resp.channels.filter((channel) => channel.is_member);
      return (accumulator || []).concat(validChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private,
        totalMembers: channel.num_members,
      })));
    };

    return webClient.paginate('conversations.list', {
      team_id: teamId,
      exclude_archived: true,
      types: 'public_channel,private_channel',
      limit: 200,
    }, this.pageShouldStop, pageReducer);
  }

  async revokeSlackConnection(userId: string, teamId: string): Promise<void> {
    const credential = await this.slackConnectionService.getCredential(userId, teamId);

    try {
      await this.slackConnectionService.removeSlackConnection(userId, teamId);
      await Promise.all([
        this.revokeToken(credential.user.accessToken, 'user', teamId),
        this.revokeToken(credential.bot.accessToken, 'bot', teamId),
      ]);
    } catch (error) {
      this.loggerService.error({
        context: this.revokeSlackConnection.name,
        message: 'Failed to revoke Slack tokens',
        error,
        extraInfo: {
          userId,
          teamId,
        },
      });
      throw error;
    }
  }

  async getSlackChannelMembers(userId: string, teamId: string, channelId: string): Promise<string[]> {
    const webClient = await this.getUserClient(userId, teamId);

    const pageReducer: PageReducer<string[]> = (accumulator, page) => {
      const resp = page as ConversationsMembersResponse;
      return (accumulator || []).concat(resp.members);
    };

    const members = webClient.paginate('conversations.members', {
      channel: channelId,
      limit: 200,
    }, this.pageShouldStop, pageReducer);
    return members;
  }

  async getSlackRecipients(userId: string, teamId: string): Promise<SlackRecipient[]> {
    const webClient = await this.getBotClient(userId, teamId);

    const pageReducer: PageReducer<SlackRecipient[]> = (accumulator, page) => {
      const resp = page as UsersListResponse;
      const validMembers = resp.members.filter((member) => member.id !== 'USLACKBOT' && !(member.deleted || member.is_bot));
      return (accumulator || []).concat(validMembers.map((member) => {
        const { id, profile } = member;
        const {
          email, real_name: name, display_name: displayName, image_192: avatarUrl,
        } = profile;
        return {
          id,
          email,
          name,
          displayName,
          avatarUrl,
        };
      }));
    };

    return webClient.paginate('users.list', {
      team_id: teamId,
      limit: 200,
    }, this.pageShouldStop, pageReducer);
  }

  async checkEmailExistsInSlackUsers(
    userId: string,
    teamId: string,
    emails: string[],
    slackUserIds: string[],
  ): Promise<boolean> {
    const webClient = await this.getBotClient(userId, teamId);

    const emailsLowerCase = new Set(emails.map((email) => email.toLowerCase()));

    const maxConcurrentRequests = 10;
    const delayBetweenRequests = 100; // milliseconds

    // Create a queue of user IDs to process
    const queue = [...slackUserIds];
    let activeRequests = 0;
    let foundMatch = false;

    return new Promise<boolean>((resolve, reject) => {
      // Function to process the next user in the queue
      async function processNextUser(): Promise<void> {
        if (foundMatch) {
          return; // Stop processing if we already found a match
        }

        if (queue.length === 0) {
          if (activeRequests === 0) {
            resolve(false); // No more users to check and no active requests
          }
          return;
        }

        const slackUserId = queue.shift();
        activeRequests++;

        try {
          const response = await webClient.users.info({ user: slackUserId });

          if (response.user?.profile?.email) {
            const userEmail = response.user.profile.email.toLowerCase();

            if (emailsLowerCase.has(userEmail)) {
              foundMatch = true;
              resolve(true); // Found a match, resolve immediately
            }
          }
        } catch (error: any) {
          reject(new Error(`Slack API error: ${error.message}`));
          return;
        } finally {
          activeRequests--;

          // Schedule the next request with a delay
          setTimeout(processNextUser, delayBetweenRequests);
        }
      }

      // Start multiple concurrent requests (up to maxConcurrentRequests)
      for (let i = 0; i < Math.min(maxConcurrentRequests, slackUserIds.length); i++) {
        setTimeout(() => processNextUser(), i * delayBetweenRequests);
      }
    });
  }

  private sanitizeSlackLink(url: string, displayText: string): string {
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };

    const safeText = displayText.replace(/[&<>"']/g, (char) => htmlEntities[char]);
    return `<${url}|${safeText}>`;
  }

  private buildDocumentShareMessage({
    document,
    slackUserId,
    slackUserName,
    sharingMessage,
  }: {
    document: IDocument;
    slackUserId: string;
    slackUserName: string;
    sharingMessage?: string;
  }): MessageAttachment[] {
    const { _id: documentId, name: documentName } = document;
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    const documentUrl = `${baseUrl}/viewer/${documentId}?from=slack`;
    const documentModificationDate = moment(document.lastModify || document.createdAt);

    const blocks: AnyBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${slackUserId}> shared a document with you${sharingMessage ? ':' : ''}`,
        },
      },
    ];
    if (sharingMessage) {
      blocks.push({
        type: 'section',
        text: {
          type: 'plain_text',
          text: sharingMessage,
        },
      });
    }
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${this.sanitizeSlackLink(documentUrl, documentName)}* in *Lumin PDF*`,
      },
    });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Last updated on ${documentModificationDate.format('MMM D, YYYY')}`,
        },
      ],
    });
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View',
          },
          url: documentUrl,
          action_id: 'view_button',
        },
      ],
    });

    const messageAttachments: MessageAttachment[] = [
      {
        blocks,
        color: '#2684ff',
        fallback: `${slackUserName} shared a document with you`,
      },
    ];

    return messageAttachments;
  }

  /**
   * Invites a Slack bot to a specific channel
   *
   * This method adds a bot user to a Slack channel using the Slack Web API.
   * If the bot is already in the channel or can't be invited, the method
   * silently succeeds rather than throwing an error.
   *
   * @param {Object} params - The parameters for inviting the bot
   * @param {string} params.botUserId - The Slack user ID of the bot to invite
   * @param {string} params.channelId - The Slack channel ID to invite the bot to
   * @throws Will throw an error for Slack API errors other than 'already_in_channel' and 'cant_invite'
   * @returns {Promise<void>} A promise that resolves when the invitation is sent
   */
  async inviteBotToChannel({
    token,
    botUserId,
    channelId,
  }: {
    token: string;
    botUserId: string;
    channelId: string;
  }): Promise<void> {
    try {
      const webClient = this.createWebClient(token);
      await webClient.conversations.invite({
        channel: channelId,
        users: botUserId,
      });
    } catch (error) {
      const errorCode = error?.data?.error as string;
      if (['already_in_channel', 'cant_invite'].includes(errorCode)) {
        return;
      }
      this.loggerService.error({
        context: this.inviteBotToChannel.name,
        message: 'Failed to invite Slack Bot to channel',
        error,
        extraInfo: {
          botUserId,
          channelId,
        },
      });
      throw error;
    }
  }

  async postShareDocumentMessage({
    userId,
    teamId,
    conversation,
    document,
    sharingMessage,
  }: {
    userId: string;
    teamId: string;
    conversation: SlackConversation;
    document: IDocument;
    sharingMessage?: string;
  }): Promise<void> {
    try {
      const credential = await this.slackConnectionService.getCredential(userId, teamId);

      if (conversation.type === SlackConversationType.CHANNEL && conversation.isPrivate) {
        const botUserId = credential.bot.userId;
        await this.inviteBotToChannel({ token: credential.user.accessToken, channelId: conversation.id, botUserId });
      }

      const slackUser = await this.getSlackUserInfo(userId, teamId, credential.user.userId);

      const slackMessage = this.buildDocumentShareMessage({
        document,
        slackUserId: credential.user.userId,
        slackUserName: slackUser.name,
        sharingMessage,
      });

      const postMessageRes = await this.createWebClient(credential.bot.accessToken).chat.postMessage({
        channel: conversation.id,
        attachments: slackMessage,
      });
      if (!postMessageRes.ok) {
        throw new Error(postMessageRes.error);
      }
    } catch (error) {
      this.loggerService.error({
        context: this.postShareDocumentMessage.name,
        message: 'Failed to post share document message to Slack',
        error,
        extraInfo: {
          userId,
          teamId,
          conversationId: conversation.id,
          documentId: document._id,
        },
      });
      throw error;
    }
  }

  async getSlackUserInfo(userId: string, teamId: string, slackUserId: string): Promise<{ id: string; email: string; name: string }> {
    try {
      const webClient = await this.getBotClient(userId, teamId);
      const resp = await webClient.users.info({ user: slackUserId });
      if (!resp.ok) {
        throw new Error(resp.error);
      }
      const { profile } = resp.user;
      return {
        id: slackUserId,
        email: profile.email,
        name: profile.real_name,
      };
    } catch (error) {
      this.loggerService.error({
        context: this.getSlackUserInfo.name,
        message: 'Failed to get slack user info',
        error,
        extraInfo: {
          userId,
          teamId,
          slackUserId,
        },
      });
      throw error;
    }
  }

  async getSlackChannelMemberEmails(
    userId: string,
    teamId: string,
    channelId: string,
  ): Promise<string[]> {
    const webClient = await this.getBotClient(userId, teamId);

    const memberIds = await this.getSlackChannelMembers(userId, teamId, channelId);

    const maxConcurrentRequests = 10;
    const delayBetweenRequests = 100; // milliseconds

    const chunks = chunk(memberIds, maxConcurrentRequests);
    const memberEmails = await chunks.reduce(async (previousPromise, batchIds, index) => {
      const previousEmails = await previousPromise;
      const batchPromises = batchIds.map(async (memberId) => {
        try {
          const response = await webClient.users.info({ user: memberId });

          if (!response.ok) {
            throw new Error(response.error);
          }

          if (!response.user?.is_bot && response.user?.profile?.email) {
            return response.user.profile.email.toLowerCase();
          }
          return null;
        } catch (error) {
          this.loggerService.error({
            context: this.getSlackChannelMemberEmails.name,
            message: `Failed to get info for user ${memberId}`,
            error,
          });
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const batchEmails = batchResults.filter(Boolean);

      // Add delay before next batch if this isn't the last batch
      if (index < chunks.length - 1) {
        await new Promise((resolve) => {
          setTimeout(resolve, delayBetweenRequests * maxConcurrentRequests);
        });
      }

      return [...previousEmails, ...batchEmails];
    }, Promise.resolve([]));

    return memberEmails;
  }

  private async revokeToken(token: string, tokenType: 'user' | 'bot', teamId: string): Promise<void> {
    try {
      if (tokenType === 'bot') {
        const hasSlackTeamConnection = await this.slackConnectionService.hasSlackTeamConnection(teamId);
        if (hasSlackTeamConnection) {
          return;
        }
      }
      const client = this.createWebClient(token);
      await client.auth.revoke();
    } catch (error) {
      this.loggerService.error({
        context: this.revokeToken.name,
        message: 'Failed to revoke Slack token',
        error,
        extraInfo: {
          tokenType,
          teamId,
        },
      });
      throw error;
    }
  }

  async testSlackConnection(userId: string, teamId: string): Promise<boolean> {
    const credential = await this.slackConnectionService.getCredential(userId, teamId);
    const botClient = this.createWebClient(credential.bot.accessToken);
    const userClient = this.createWebClient(credential.user.accessToken);

    const [botTest, userTest] = await Promise.all([
      botClient.auth.test().catch((error) => error.data),
      userClient.auth.test().catch((error) => error.data),
    ]);

    if (botTest.ok && userTest.ok) {
      return true;
    }

    // Revoke tokens and remove Slack connection if either test fails
    if (!botTest.ok || !userTest.ok) {
      if (botTest.ok) {
        await this.revokeToken(credential.bot.accessToken, 'bot', teamId);
      }

      if (userTest.ok) {
        await this.revokeToken(credential.user.accessToken, 'user', teamId);
      }

      await this.slackConnectionService.removeSlackConnection(userId, teamId);
    }
    return false;
  }

  private buildSmbNotificationMessage({
    organization,
    notificationType,
  }: {
    organization: IOrganization;
    notificationType: SlackSMBNotificationType;
  }): MessageAttachment[] {
    const { _id: organizationId, name: organizationName } = organization;
    const baseUrl = this.environmentService.getByKey(EnvConstants.SALE_DASHBOARD_URL);
    const orgDetailUrl = `${baseUrl}/circle/detail/${organizationId}/information`;
    const sanitizedOrgDetailUrl = this.sanitizeSlackLink(orgDetailUrl, organizationName);

    let actionText = '';
    switch (notificationType) {
      case SlackSMBNotificationType.STARTED_TRIAL:
        actionText = 'just started a trial.';
        break;
      case SlackSMBNotificationType.CANCELED_TRIAL:
        actionText = 'has canceled their trial.';
        break;
      case SlackSMBNotificationType.SCHEDULED_CANCELLATION:
        actionText = 'has scheduled a cancellation.';
        break;
      case SlackSMBNotificationType.EXPERIENCES_RENEWAL_ISSUES:
        actionText = 'encountered a renewal issue.';
        break;
      default:
        throw new Error(`Unsupported notification type: ${notificationType}`);
    }

    const blocks: AnyBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${sanitizedOrgDetailUrl}* ${actionText}`,
        },
      },
    ];

    const messageAttachments: MessageAttachment[] = [
      {
        blocks,
        color: '#2684ff',
        fallback: `${organizationName} ${actionText}`,
      },
    ];

    return messageAttachments;
  }

  async postSmbNotification({
    organization,
    notificationType,
  }: {
    organization: IOrganization;
    notificationType: SlackSMBNotificationType;
  }): Promise<void> {
    try {
      if (this.smbIncomingWebhook) {
        const messageAttachments = this.buildSmbNotificationMessage({ organization, notificationType });
        await this.smbIncomingWebhook.send({
          attachments: messageAttachments,
        });
      }
    } catch (error) {
      this.loggerService.error({
        context: this.postSmbNotification.name,
        message: 'Failed to post SMB notification',
        error,
        extraInfo: {
          organizationId: organization._id,
          notificationType,
        },
      });
      throw error;
    }
  }
}
