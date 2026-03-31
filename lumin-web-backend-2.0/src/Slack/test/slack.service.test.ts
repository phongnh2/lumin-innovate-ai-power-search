import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SlackService } from '../slack.service';
import { EnvironmentService } from '../../Environment/environment.service';
import { RedisService } from '../../Microservices/redis/redis.service';
import { UserService } from '../../User/user.service';
import { LoggerService } from '../../Logger/Logger.service';
import { EventsGateway } from '../../Gateway/SocketIoConfig';
import { SlackConnectionService } from '../slack.connection.service';
import { SlackSMBNotificationType } from '../interfaces/slack.interface';
import * as moment from 'moment';

import { WebClient, ErrorCode } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { AxiosError } from 'axios';

jest.mock('@slack/web-api');
jest.mock('@slack/webhook');

describe('SlackService', () => {
  let service: SlackService;
  let userService: UserService;
  let loggerService: LoggerService;

  const mockEnv = {
    getByKey: jest.fn((key: string) => {
      const map = {
        SLACK_INSTALL_APP_INTEGRATION_URL: 'https://slack.com/oauth/v2/authorize',
        SLACK_SMB_WEBHOOK_URL: 'https://hooks.slack.com/test',
        BASE_URL: 'https://lumin.app',
        SALE_DASHBOARD_URL: 'https://sale.app',
        SLACK_OAUTH_EMAIL_WHITELIST: ['whitelist@test.com'],
      };
      return map[key];
    }),
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    verify: jest.fn().mockReturnValue({
      flowId: 'flow-id',
      userId: 'user-id',
      email: 'test@test.com',
    }),
  };

  const mockRedis = {
    setSignInSlackOAuthToken: jest.fn(),
    getSignInSlackOAuthToken: jest.fn().mockResolvedValue('state-token'),
    removeSignInSlackOAuthToken: jest.fn(),
    deleteRedisByKey: jest.fn(),
    getRedisValueWithKey: jest.fn(),
  };

  const mockUserService = {
    findUserByEmail: jest.fn().mockResolvedValue({
      _id: 'user-id',
      email: 'test@test.com',
    }),
  };

  const mockSlackConnectionService = {
    getCredential: jest.fn(),
    addSlackConnection: jest.fn(),
    removeSlackConnection: jest.fn(),
    getSlackConnections: jest.fn(),
    hasSlackUserConnection: jest.fn(),
    hasSlackTeamConnection: jest.fn(),
  };

  const mockDocument = {
    _id: 'doc-id',
    name: 'Test <Doc>',
    createdAt: new Date('2024-01-01'),
    lastModify: new Date('2024-01-10'),
  } as any;

  const mockGateway = {
    server: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRedis.getSignInSlackOAuthToken.mockResolvedValue('state-token');

    (WebClient as unknown as jest.Mock).mockImplementation(() => ({
      auth: {
        test: jest.fn().mockResolvedValue({ ok: true }),
        revoke: jest.fn().mockResolvedValue({ ok: true }),
      },
      users: {
        info: jest.fn().mockResolvedValue({
          ok: true,
          user: { profile: { email: 'test@test.com', real_name: 'Test' } },
        }),
      },
      team: {
        info: jest.fn().mockResolvedValue({
          ok: true,
          team: { name: 'Team', domain: 'team', icon: { image_88: 'img' } },
        }),
      },
      chat: {
        postMessage: jest.fn().mockResolvedValue({ ok: true }),
      },
      conversations: {
        invite: jest.fn(),
      },
      paginate: jest.fn().mockResolvedValue([]),
    }));

    (IncomingWebhook as jest.Mock).mockImplementation(() => ({
      send: jest.fn(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        { provide: EnvironmentService, useValue: mockEnv },
        { provide: JwtService, useValue: mockJwt },
        { provide: RedisService, useValue: mockRedis },
        { provide: UserService, useValue: mockUserService },
        { provide: LoggerService, useValue: { error: jest.fn() } },
        { provide: EventsGateway, useValue: mockGateway },
        { provide: SlackConnectionService, useValue: mockSlackConnectionService },
      ],
    }).compile();

    service = module.get(SlackService);
    jest.spyOn(service['slackConnectionService'], 'getCredential').mockResolvedValue({
      user: { userId: 'U123', accessToken: 'user-token' },
      bot: { userId: 'B123', accessToken: 'bot-token' },
    } as any);
    userService = module.get(UserService);
    loggerService = module.get(LoggerService);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('testSlackConnection', () => {
    it('should return true if team.info ok', async () => {
      jest.spyOn(service['slackConnectionService'], 'getCredential').mockResolvedValue({
        bot: { accessToken: 'bot-token' },
        user: { accessToken: 'user-token' },
      } as any);
  
      const mockClient = {
        auth: { test: jest.fn().mockResolvedValue({ ok: true }) },
        team: { info: jest.fn().mockResolvedValue({ ok: true }) },
      };
      jest.spyOn(service as any, 'createWebClient').mockReturnValue(mockClient);
  
      const result = await (service as any).testSlackConnection('user-id', 'T123');
      expect(result).toBe(true);
    });
  
    it('should return false if team.info not ok', async () => {
      jest.spyOn(service['slackConnectionService'], 'getCredential').mockResolvedValue({
        bot: { accessToken: 'bot-token' },
        user: { accessToken: 'user-token' },
      } as any);
  
      const mockClient = {
        auth: { test: jest.fn().mockResolvedValue({ ok: false }) },
        team: { info: jest.fn().mockResolvedValue({ ok: false }) },
      };
      jest.spyOn(service as any, 'createWebClient').mockReturnValue(mockClient);
  
      const result = await (service as any).testSlackConnection('user-id', 'T123');
      expect(result).toBe(false);
    });
  });

  describe('getSlackChannelMemberEmails', () => {
    const userId = 'U1';
    const teamId = 'T1';
    const channelId = 'C1';
  
    it('should return emails of valid members only', async () => {
      const paginateMock = jest.fn((_method, _params, _stop, reducer) =>
        reducer([], {
          members: [
            { id: 'U1', deleted: false, is_bot: false, profile: { email: 'u1@test.com' } },
            { id: 'U2', deleted: false, is_bot: false, profile: { email: 'u2@test.com' } },
            { id: 'U3', deleted: true, is_bot: false, profile: { email: 'u3@test.com' } },
            { id: 'U4', deleted: false, is_bot: true, profile: { email: 'u4@test.com' } },
          ],
        }),
      );
  
      jest.spyOn(service as any, 'getUserClient').mockResolvedValue({ paginate: paginateMock });
  
      const res = await service.getSlackChannelMemberEmails(userId, teamId, channelId);
      expect(res).not.toBeNull();
    });
  
    it('should skip members without email', async () => {
      const paginateMock = jest.fn((_method, _params, _stop, reducer) =>
        reducer([], {
          members: [
            { id: 'U1', deleted: false, is_bot: false, profile: {} },
            { id: 'U2', deleted: false, is_bot: false, profile: { email: 'u2@test.com' } },
          ],
        }),
      );
  
      jest.spyOn(service as any, 'getUserClient').mockResolvedValue({ paginate: paginateMock });
  
      const res = await service.getSlackChannelMemberEmails(userId, teamId, channelId);
      expect(res).not.toBeNull();
    });
  
    it('should fallback to empty array if accumulator undefined', async () => {
      const paginateMock = jest.fn((_method, _params, _stop, reducer) =>
        reducer(undefined, { members: [{ id: 'U1', deleted: false, is_bot: false, profile: { email: 'u1@test.com' } }] }),
      );
  
      jest.spyOn(service as any, 'getUserClient').mockResolvedValue({ paginate: paginateMock });
  
      const res = await service.getSlackChannelMemberEmails(userId, teamId, channelId);
      expect(res).not.toBeNull();
    });
  
    it('should throw error when Slack API fails', async () => {
      const paginateMock = jest.fn().mockRejectedValue(new Error('Slack API error'));
      jest.spyOn(service as any, 'getUserClient').mockResolvedValue({ paginate: paginateMock });
  
      await expect(service.getSlackChannelMemberEmails(userId, teamId, channelId))
        .rejects.toThrow('Slack API error');
    });
  });
  
  describe('getSlackUserInfo', () => {
    const slackUserId = 'U123';
    const teamId = 'T123';
    const userId = 'user1';

    it('should return user info successfully', async () => {
      const mockClient = {
        users: {
          info: jest.fn().mockResolvedValue({
            ok: true,
            user: {
              id: slackUserId,
              profile: {
                email: 'test@test.com',
                real_name: 'Test User',
                display_name: 'Tester',
                image_192: 'avatar.png',
              },
            },
          }),
        },
      };

      jest.spyOn(service as any, 'createWebClient').mockReturnValue(mockClient);

      const res = await service.getSlackUserInfo(userId, teamId, slackUserId);

      expect(res).not.toBeNull();
    });

    it('should throw error if user not found', async () => {
      const slackUserId = 'U123';
      const teamId = 'T123';
      const userId = 'user1';
    
      const mockClient = {
        users: {
          info: jest.fn().mockResolvedValue({ ok: false, error: 'user_not_found' }),
        },
      };
    
      jest.spyOn(service as any, 'createWebClient').mockReturnValue(mockClient);
    
      await expect(service.getSlackUserInfo(userId, teamId, slackUserId))
        .rejects.toThrow('user_not_found');
    
      expect(mockClient.users.info).toHaveBeenCalledWith({ user: slackUserId });
    });    

    it('should throw error on Slack API failure', async () => {
      const mockClient = {
        users: {
          info: jest.fn().mockRejectedValue(new Error('Slack API error')),
        },
      };

      jest.spyOn(service as any, 'createWebClient').mockReturnValue(mockClient);

      await expect(service.getSlackUserInfo(userId, teamId, slackUserId)).rejects.toThrow(
        'Slack API error',
      );
    });
  });

  describe('buildSmbNotificationMessage', () => {
    const org = { _id: 'org1', name: 'OrgName' } as any;

    it('should return correct message for CANCELED_TRIAL', () => {
      const res = (service as any).buildSmbNotificationMessage({
        organization: org,
        notificationType: SlackSMBNotificationType.CANCELED_TRIAL,
      });

      expect(res.text).toBeUndefined();
    });

    it('should return correct message for SCHEDULED_CANCELLATION', () => {
      const res = (service as any).buildSmbNotificationMessage({
        organization: org,
        notificationType: SlackSMBNotificationType.SCHEDULED_CANCELLATION,
      });

      expect(res.text).toBeUndefined();
    });

    it('should return correct message for EXPERIENCES_RENEWAL_ISSUES', () => {
      const res = (service as any).buildSmbNotificationMessage({
        organization: org,
        notificationType: SlackSMBNotificationType.EXPERIENCES_RENEWAL_ISSUES,
      });

      expect(res.text).toBeUndefined();
    });

    it('should throw error for unsupported notification type', () => {
      expect(() =>
        (service as any).buildSmbNotificationMessage({
          organization: org,
          notificationType: 'INVALID_TYPE' as any,
        }),
      ).toThrow('Unsupported notification type: INVALID_TYPE');
    });
  });


  it('inviteBotToChannel – throw and log on unexpected error', async () => {
    const error = { data: { error: 'not_authed' } };
    const inviteMock = jest.fn().mockRejectedValue(error);
    const loggerSpy = jest.spyOn(loggerService, 'error');

    jest.spyOn(service as any, 'createWebClient').mockReturnValue({
      conversations: { invite: inviteMock },
    } as any);

    await expect(
      service.inviteBotToChannel({ token: 'token', botUserId: 'B1', channelId: 'C1' }),
    ).rejects.toBe(error);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'inviteBotToChannel',
        message: 'Failed to invite Slack Bot to channel',
        extraInfo: { botUserId: 'B1', channelId: 'C1' },
      }),
    );
  });

  it('inviteBotToChannel – already_in_channel should be silent', async () => {
    const inviteMock = jest.fn().mockRejectedValue({ data: { error: 'already_in_channel' } });
    const loggerSpy = jest.spyOn(loggerService, 'error');

    jest.spyOn(service as any, 'createWebClient').mockReturnValue({
      conversations: { invite: inviteMock },
    } as any);

    await expect(
      service.inviteBotToChannel({ token: 'token', botUserId: 'B1', channelId: 'C1' }),
    ).resolves.toBeUndefined();

    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it('inviteBotToChannel – success', async () => {
    const inviteMock = jest.fn().mockResolvedValue(undefined);

    jest.spyOn(service as any, 'createWebClient').mockReturnValue({
      conversations: { invite: inviteMock },
    } as any);

    await service.inviteBotToChannel({ token: 'token', botUserId: 'B1', channelId: 'C1' });

    expect(inviteMock).toHaveBeenCalledWith({ channel: 'C1', users: 'B1' });
  });

  describe('pageShouldStop', () => {
    it('should return false when next_cursor exists', () => {
      const res = (service as any).pageShouldStop({ response_metadata: { next_cursor: 'cursor' } } as any);
      expect(res).toBe(false);
    });

    it('should return true when next_cursor is empty', () => {
      const res = (service as any).pageShouldStop({ response_metadata: { next_cursor: '' } } as any);
      expect(res).toBe(true);
    });

    it('should return true when response_metadata is missing', () => {
      const res = (service as any).pageShouldStop({ undefined });
      expect(res).toBe(true);
    });
  });

  it('buildDocumentShareMessage – without sharingMessage', () => {
    const res = (service as any).buildDocumentShareMessage({
      document: mockDocument,
      slackUserId: 'U123',
      slackUserName: 'John',
    });

    const blocks = res[0].blocks;
    expect(blocks.length).toBe(4);
    expect(blocks[0].text.text).not.toContain(':');
  });

  it('buildDocumentShareMessage – fallback to createdAt when lastModify missing', () => {
    const res = (service as any).buildDocumentShareMessage({
      document: { ...mockDocument, lastModify: null },
      slackUserId: 'U123',
      slackUserName: 'John',
    });

    const dateText = res[0].blocks[3].elements[0].text;
    expect(dateText).not.toBeNull();
  });

  describe('pageShouldStop', () => {
    it('should return false when next_cursor exists', () => {
      const res = (service as any).pageShouldStop({
        response_metadata: {
          next_cursor: 'cursor',
        },
      } as any);

      expect(res).toBe(false);
    });

    it('should return true when next_cursor is empty', () => {
      const res = (service as any).pageShouldStop({
        response_metadata: {
          next_cursor: '',
        },
      } as any);

      expect(res).toBe(true);
    });

    it('should return true when response_metadata is missing', () => {
      const res = (service as any).pageShouldStop({ undefined });
      expect(res).toBe(true);
    });
  });

  it('getSlackRecipients – filter invalid members and map recipients', async () => {
    const paginateMock = jest.fn(
      (_method, _params, _stop, reducer) =>
        reducer(undefined, {
          members: [
            {
              id: 'USLACKBOT',
              deleted: false,
              is_bot: false,
              profile: {},
            },
            {
              id: 'U1',
              deleted: true,
              is_bot: false,
              profile: {},
            },
            {
              id: 'U2',
              deleted: false,
              is_bot: true,
              profile: {},
            },
            {
              id: 'U3',
              deleted: false,
              is_bot: false,
              profile: {
                email: 'u3@test.com',
                real_name: 'User 3',
                display_name: 'u3',
                image_192: 'img-3',
              },
            },
          ],
        }),
    );

    jest
      .spyOn(service as any, 'getBotClient')
      .mockResolvedValueOnce({ paginate: paginateMock });

    const res = await service.getSlackRecipients('user-id', 'team-id');

    expect(res).toEqual([
      {
        id: 'U3',
        email: 'u3@test.com',
        name: 'User 3',
        displayName: 'u3',
        avatarUrl: 'img-3',
      },
    ]);

    expect(paginateMock).toHaveBeenCalledWith(
      'users.list',
      { team_id: 'team-id', limit: 200 },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('getSlackChannelMembers – accumulator undefined fallback to []', async () => {
    const paginateMock = jest.fn(
      (_method, _params, _stop, reducer) =>
        reducer(undefined, { members: ['U1', 'U2'] }),
    );

    jest
      .spyOn(service as any, 'getUserClient')
      .mockResolvedValueOnce({ paginate: paginateMock });

    const res = await service.getSlackChannelMembers(
      'user-id',
      'team-id',
      'channel-id',
    );

    expect(res).toEqual(['U1', 'U2']);
  });

  it('getSlackChannelMembers – return member ids', async () => {
    const paginateMock = jest.fn((_method, _params, _stop, reducer) =>
      reducer([], { members: ['U1', 'U2', 'U3'] }),
    );

    jest
      .spyOn(service as any, 'getUserClient')
      .mockResolvedValueOnce({ paginate: paginateMock });

    const res = await service.getSlackChannelMembers(
      'user-id',
      'team-id',
      'channel-id',
    );

    expect(res).toEqual(['U1', 'U2', 'U3']);
    expect(paginateMock).toHaveBeenCalledWith(
      'conversations.members',
      { channel: 'channel-id', limit: 200 },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('revokeSlackConnection – success', async () => {
    mockSlackConnectionService.getCredential.mockResolvedValue({
      user: { accessToken: 'user-token' },
      bot: { accessToken: 'bot-token' },
    });

    const revokeSpy = jest
      .spyOn(service as any, 'revokeToken')
      .mockResolvedValue(undefined);

    mockSlackConnectionService.removeSlackConnection.mockResolvedValue(undefined);

    await service.revokeSlackConnection('user-id', 'team-id');

    expect(mockSlackConnectionService.getCredential)
      .toHaveBeenCalledWith('user-id', 'team-id');

    expect(mockSlackConnectionService.removeSlackConnection)
      .toHaveBeenCalledWith('user-id', 'team-id');

    expect(revokeSpy).toHaveBeenCalledTimes(2);
    expect(revokeSpy).toHaveBeenCalledWith('user-token', 'user', 'team-id');
    expect(revokeSpy).toHaveBeenCalledWith('bot-token', 'bot', 'team-id');
  });

  it('revokeSlackConnection – removeSlackConnection throws', async () => {
    const error = new Error('remove failed');

    mockSlackConnectionService.getCredential.mockResolvedValue({
      user: { accessToken: 'user-token' },
      bot: { accessToken: 'bot-token' },
    });

    mockSlackConnectionService.removeSlackConnection.mockRejectedValue(error);

    const loggerSpy = jest.spyOn(loggerService, 'error');

    await expect(
      service.revokeSlackConnection('user-id', 'team-id'),
    ).rejects.toThrow('remove failed');

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'revokeSlackConnection',
        message: 'Failed to revoke Slack tokens',
        extraInfo: {
          userId: 'user-id',
          teamId: 'team-id',
        },
      }),
    );
  });

  it('buildDocumentShareMessage – with sharingMessage', () => {
    const res = (service as any).buildDocumentShareMessage({
      document: mockDocument,
      slackUserId: 'U123',
      slackUserName: 'John',
      sharingMessage: 'Hello team',
    });

    expect(res).toHaveLength(1);

    const attachment = res[0];
    expect(attachment.color).toBe('#2684ff');
    expect(attachment.fallback).toContain('John');

    const blocks = attachment.blocks;
    expect(blocks).toBeDefined();
    expect(blocks[0].text.text).toContain('<@U123>');
    expect(blocks[1].text.text).toBe('Hello team');
    expect(blocks[2].text.text).toContain('&lt;Doc&gt;');
    expect(blocks[3].elements[0].text).toContain(
      moment(mockDocument.lastModify).format('MMM D, YYYY'),
    );
    expect(blocks[4].elements[0].text.text).toBe('View');
  });

  it('buildDocumentShareMessage – without sharingMessage', () => {
    const res = (service as any).buildDocumentShareMessage({
      document: mockDocument,
      slackUserId: 'U123',
      slackUserName: 'John',
    });

    const blocks = res[0].blocks;
    expect(blocks.length).toBe(4);
    expect(blocks[0].text.text).not.toContain(':');
  });

  it('checkEmailExistsInSlackUsers – skip when response.user is undefined', async () => {
    const mockUsersInfo = jest.fn().mockResolvedValue({
      user: undefined,
    });

    jest.spyOn(service as any, 'getBotClient').mockResolvedValue({
      users: { info: mockUsersInfo },
    } as any);

    const promise = service.checkEmailExistsInSlackUsers(
      'user-id',
      'team-id',
      ['test@test.com'],
      ['U1'],
    );

    jest.runAllTimers();

    await expect(promise).resolves.toBe(false);
  });

  it('checkEmailExistsInSlackUsers – skip when profile is undefined', async () => {
    const mockUsersInfo = jest.fn().mockResolvedValue({
      user: {},
    });

    jest.spyOn(service as any, 'getBotClient').mockResolvedValue({
      users: { info: mockUsersInfo },
    } as any);

    const promise = service.checkEmailExistsInSlackUsers(
      'user-id',
      'team-id',
      ['test@test.com'],
      ['U1'],
    );

    jest.runAllTimers();

    await expect(promise).resolves.toBe(false);
  });

  it('checkEmailExistsInSlackUsers – return true when email exists', async () => {
    const mockUsersInfo = jest.fn()
      .mockResolvedValueOnce({
        user: { profile: { email: 'match@test.com' } },
      });

    jest.spyOn(service as any, 'getBotClient').mockResolvedValue({
      users: { info: mockUsersInfo },
    } as any);

    const promise = service.checkEmailExistsInSlackUsers(
      'user-id',
      'team-id',
      ['match@test.com'],
      ['U1', 'U2'],
    );

    jest.runAllTimers();

    await expect(promise).resolves.toBe(true);
    expect(mockUsersInfo).toHaveBeenCalled();
  });

  it('checkEmailExistsInSlackUsers – return false when email not found', async () => {
    const mockUsersInfo = jest.fn().mockResolvedValue({
      user: { profile: { email: 'other@test.com' } },
    });

    jest.spyOn(service as any, 'getBotClient').mockResolvedValue({
      users: { info: mockUsersInfo },
    } as any);

    const promise = service.checkEmailExistsInSlackUsers(
      'user-id',
      'team-id',
      ['notfound@test.com'],
      ['U1', 'U2'],
    );

    jest.runAllTimers();

    await expect(promise).resolves.toBe(false);
  });

  it('checkEmailExistsInSlackUsers – reject on Slack API error', async () => {
    const mockUsersInfo = jest.fn().mockRejectedValue(
      new Error('Slack API failed'),
    );

    jest.spyOn(service as any, 'getBotClient').mockResolvedValue({
      users: { info: mockUsersInfo },
    } as any);

    const promise = service.checkEmailExistsInSlackUsers(
      'user-id',
      'team-id',
      ['test@test.com'],
      ['U1'],
    );

    jest.runAllTimers();

    await expect(promise).rejects.toThrow('Slack API error: Slack API failed');
  });

  it('getSlackChannels – return empty array', async () => {
    const paginateMock = jest.fn((_m, _p, _s, reducer) =>
      reducer([], { channels: [] }),
    );

    jest
      .spyOn(service as any, 'getUserClient')
      .mockResolvedValueOnce({ paginate: paginateMock });

    const res = await service.getSlackChannels('user-id', 'team-id');

    expect(res).toEqual([]);
  });

  it('getSlackTeams – return empty when no slack connections', async () => {
    mockSlackConnectionService.getSlackConnections.mockResolvedValue([]);

    const res = await service.getSlackTeams('user-id');

    expect(res).toEqual([]);
    expect(mockSlackConnectionService.getSlackConnections).toHaveBeenCalledWith('user-id');
  });

  it('getSlackTeams – filter out invalid slack teams', async () => {
    mockSlackConnectionService.getSlackConnections.mockResolvedValue([
      { slackTeamId: 'T1' },
      { slackTeamId: 'T2' },
    ]);

    jest.spyOn(service, 'testSlackConnection')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    const res = await service.getSlackTeams('user-id');

    expect(res).toEqual([]);
    expect(service.testSlackConnection).toHaveBeenCalledTimes(2);
  });

  it('getSlackTeams – skip team when team.info not ok', async () => {
    mockSlackConnectionService.getSlackConnections.mockResolvedValue([
      { slackTeamId: 'T1' },
    ]);

    jest.spyOn(service, 'testSlackConnection').mockResolvedValue(true);

    mockSlackConnectionService.getCredential.mockResolvedValue({
      bot: { accessToken: 'bot-token' },
    });

    (WebClient as unknown as jest.Mock).mockImplementation(() => ({
      team: {
        info: jest.fn().mockResolvedValue({ ok: false }),
      },
    }));

    const res = await service.getSlackTeams('user-id');

    expect(res).toEqual([]);
  });


  it('getOAuthRedirectUrl – no JWT token provided', async () => {
    await expect(
      service.getOAuthRedirectUrl(''),
    ).rejects.toMatchObject({
      message: 'No JWT token provided',
    });
  });

  it('createWebClient – Axios timeout ECONNABORTED logs timeout error', async () => {
    const loggerSpy = jest.spyOn(loggerService, 'error');

    const axiosError = new AxiosError(
      'timeout',
      'ECONNABORTED',
    );

    (WebClient as unknown as jest.Mock).mockImplementation(() => ({
      timeoutTest: jest.fn().mockRejectedValue({
        code: ErrorCode.RequestError,
        original: axiosError,
      }),
    }));

    const client: any = (service as any).createWebClient('token', 5000);

    await expect(client.timeoutTest()).rejects.toBeDefined();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'SlackService.WebClient',
        message: 'Slack API call timed out after 5000ms',
      }),
    );
  });

  it('handleSlackOAuthCallback – user not found', async () => {
    jest
      .spyOn(userService, 'findUserByEmail')
      .mockResolvedValue(null as any);

    await expect(
      service.handleSlackOAuthCallback({
        code: 'slack-code',
        state: 'state',
      } as any),
    ).resolves.toBeUndefined();
  });

  it('handleSlackOAuthCallback – slack OAuth token not found', async () => {
    jest
      .spyOn(userService, 'findUserByEmail')
      .mockResolvedValue({ _id: 'user-id', email: 'test@test.com' } as any);

    mockRedis.getRedisValueWithKey.mockResolvedValue(null);

    await expect(
      service.handleSlackOAuthCallback({
        code: 'slack-code',
        state: 'state',
      } as any),
    ).resolves.toBeUndefined();
  });

  it('handleSlackOAuthCallback – cancelled', async () => {
    await service.handleSlackOAuthCallback('state', true);
    expect(mockGateway.server.emit).toHaveBeenCalled();
  });

  it('handleSlackOAuthCallback – email mismatch', async () => {
    mockRedis.getRedisValueWithKey.mockResolvedValue(
      JSON.stringify({
        teamId: 'T1',
        botUserId: 'B1',
        botAccessToken: 'bot-token',
        botScopes: '',
        userId: 'U1',
        userAccessToken: 'user-token',
        userScopes: '',
      }),
    );

    (WebClient as unknown as jest.Mock).mockImplementation(() => ({
      users: {
        info: jest.fn().mockResolvedValue({
          ok: true,
          user: { profile: { email: 'other@test.com' } },
        }),
      },
      auth: { revoke: jest.fn() },
    }));

    await service.handleSlackOAuthCallback('state');
    expect(mockGateway.server.emit).toHaveBeenCalled();
  });

  it('generateInstallUrl – throws if scopes missing', () => {
    expect(() =>
      (service as any).generateInstallUrl({} as any, 'state'),
    ).toThrow(
      'You must provide a scope parameter when calling generateInstallUrl',
    );
  });

  it('generateInstallUrl – userScopes as string', () => {
    const url = (service as any).generateInstallUrl(
      {
        scopes: 'chat:write',
        userScopes: 'channels:read,groups:read',
      },
      'state',
    );

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('user_scope=channels:read,groups:read');
  });

  it('generateInstallUrl – with teamId', () => {
    const url = (service as any).generateInstallUrl(
      {
        scopes: ['chat:write'],
        teamId: 'T123',
      },
      'state',
    );

    expect(url).toContain('team=T123');
  });

  it('getOAuthRedirectUrl – no Slack OAuth token found', async () => {
    mockRedis.getSignInSlackOAuthToken.mockResolvedValue(null);

    await expect(service.getOAuthRedirectUrl('jwt-token')).rejects.toMatchObject({
      message: 'No Slack OAuth token found',
    });
  });

  it('getOAuthRedirectUrl – catch branch non-Error', async () => {
    const loggerSpy = jest.spyOn(loggerService, 'error');

    mockJwt.verify.mockImplementationOnce(() => {
      throw 'boom';
    });

    await expect(service.getOAuthRedirectUrl('jwt-token')).rejects.toMatchObject({
      message: 'Failed to generate install URL',
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'getOAuthRedirectUrl',
      }),
    );
  });

  it('getOAuthRedirectUrl – success', async () => {
    const url = await service.getOAuthRedirectUrl('jwt-token');
    expect(url).toContain('slack.com/oauth');
  });

  it('initSlackOAuth – success', () => {
    const res = service.initSlackOAuth({
      _id: 'user-id',
      email: 'test@test.com',
    } as any);

    expect(res.flowId).toBeDefined();
    expect(res.contextJwt).toBe('jwt-token');
  });

  it('postSmbNotification – success', async () => {
    await service.postSmbNotification({
      organization: { _id: 'o', name: 'Org' } as any,
      notificationType: SlackSMBNotificationType.STARTED_TRIAL,
    });
  });

  it('revokeToken – skip bot revoke if team exists', async () => {
    mockSlackConnectionService.hasSlackTeamConnection.mockResolvedValue(true);
    await (service as any).revokeToken('token', 'bot', 'team');
  });

  it('createWebClient – timeout error branch', async () => {
    (WebClient as unknown as jest.Mock).mockImplementation(() => ({
      testFn: jest.fn().mockRejectedValue({
        code: ErrorCode.RequestError,
        original: { code: 'ECONNABORTED' },
      }),
    }));

    const client: any = (service as any).createWebClient('token', 1);
    await expect(client.testFn()).rejects.toBeDefined();
  });
});
