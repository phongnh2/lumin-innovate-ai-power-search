/* eslint-disable import/no-extraneous-dependencies */
import { PutEventsRequest } from '@aws-sdk/client-pinpoint';
import { Injectable } from '@nestjs/common';
import { createClient } from '@redis/client';
import { RedisCommandArgument } from '@redis/client/dist/lib/commands';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { Callback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';
import { IDocumentInsight, INonDocumentStat } from 'Dashboard/interfaces/dashboard.interface';
import {
  FORM_FIELD_DETECTION_DAILY_QUOTA,
  AUTO_DETECTION_DAILY_QUOTA,
} from 'Document/DocumentFormFieldDetection/documentFormFieldDetection.constants';
import { EnvironmentService } from 'Environment/environment.service';
import { CredentialsFromOpenGooglePayload, ExtraTrialDaysOrganizationAction } from 'graphql.schema';
import {
  ChannelMember,
  UserDelete,
  SetMailReminderSubscriptionExpiredInput,
  IStripeRenewAttempt,
  IPricingUserMigration,
} from 'Microservices/redis/redis.interface';
import { DocumentMigrationResult, IExtraTrialDaysOrganization } from 'Organization/interfaces/organization.interface';
import { IntentStatus } from 'Payment/payment.enum';
import { RATE_LIMITER_LIMIT } from 'RateLimiter/rateLimiter.interface';
import { User } from 'User/interfaces/user.interface';
import { DocViewerInteractionType } from 'User/user.enum';
import { IActiveContact } from 'UserTracking/interfaces/contact.interface';

@Injectable()
export class RedisService {
  private redisClient = createClient({ url: this.environmentService.getByKey(EnvConstants.REDIS_URL) });

  private subcribeRedisClient = createClient({ url: this.environmentService.getByKey(EnvConstants.REDIS_URL) });

  constructor(
    private readonly environmentService: EnvironmentService,
    @Callback(RedisConstants.REDIS_EXPIRED) private readonly redisExpiredCallback: CallbackService,
  ) {
    this.connectToRedis();
  }

  async connectToRedis(): Promise<void> {
    this.redisClient.on('error', (error) => console.log(JSON.stringify({ context: 'redis_client_error', error, level: 'error' })));
    this.subcribeRedisClient.on('error', (error) => console.log(JSON.stringify({ context: 'subscibe_redis_client_error', error, level: 'error' })));
    await Promise.all([
      this.redisClient.connect(),
      this.subcribeRedisClient.connect(),
    ]);
    await this.subcribeToExpireEvent();
  }

  private async subcribeToExpireEvent() {
    await this.subcribeRedisClient.configSet('notify-keyspace-events', 'Ex');

    this.subcribeRedisClient.subscribe(RedisConstants.EXPIRED_EVENT, (message, channel) => {
      this.redisExpiredCallback.run({ channel, key: message });
    });
  }

  /**
   * ⚠️ WARNING: Avoid using the Redis `KEYS` command in production.
   *
   * This command performs a full scan of the keyspace and can severely
   * impact Redis performance, especially on large datasets.
   *
   * @deprecated Not recommended for production usage.
   */
  public getKeys(pattern: string | Buffer) : Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async isKeyExisted(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return Boolean(result);
  }

  public setHsetData(id: string, key: string, value: string) {
    this.redisClient.hSet(id, key, value);
  }

  public async setMultipleHsetData(id: string, data: Record<string, string>): Promise<void> {
    await this.redisClient.hSet(id, data);
  }

  public async setHsetAsync(id: string, key: string, value: string): Promise<number> {
    return this.redisClient.hSet(id, key, value);
  }

  public async rightPush<T extends RedisCommandArgument>(key: string, elements: T | T[]): Promise<number> {
    return this.redisClient.rPush(key, elements);
  }

  public getKeyFromHset(id: string, key: string) {
    return this.redisClient.hGet(id, key);
  }

  public getValueFromHset(id: string, key: string) {
    return this.redisClient.hGet(id, key);
  }

  public async getAllHsetData<T = any>(id: string): Promise<({ key: string, value: T })[]> {
    const result: Record<string, any> = await this.redisClient.hGetAll(id);
    if (!result) {
      return [];
    }
    return Object.keys(result).map((key) => ({
      key,
      value: result[key],
    }));
  }

  async getHashLength(id: string): Promise<number> {
    return this.redisClient.hLen(id);
  }

  public async removeKeyFromhset(id: string, key: string): Promise<boolean> {
    const result = await this.redisClient.hDel(id, key);
    return Boolean(result);
  }

  public setInviteToTeamEmail(teamId: string, email: string, role: string, token: string): void {
    const key = `IN:${email}:${teamId}`;
    this.redisClient.set(key, token);
    this.setHsetData(`INS:${teamId}`, email, role);
    this.setHsetData(`INS:${email}`, teamId, '1');
    this.redisClient.expire(key, Number(this.environmentService.getByKey(EnvConstants.EXPIRE_INVITE_EMAIL_TO_TEAM)));
    this.redisClient.expire(`INS:${teamId}`, Number(this.environmentService.getByKey(EnvConstants.EXPIRE_INVITE_EMAIL_TO_TEAM)));
    this.redisClient.expire(`INS:${email}`, Number(this.environmentService.getByKey(EnvConstants.EXPIRE_INVITE_EMAIL_TO_TEAM)));
  }

  public setUserUploadingDocument(userId: string, fileSize: number): string {
    const hsetId = `UPLOADING:${userId}`;
    const key = uuid();
    this.setHsetData(hsetId, key, JSON.stringify(fileSize));
    this.setHsetData(hsetId, 'totalSize', '0');
    return key;
  }

  public async getTotalSizeUploaded(hsetId: string): Promise<number> {
    const totalSize = await this.getValueFromHset(hsetId, 'totalSize');
    return Number(totalSize);
  }

  /**
   * ⚠️ WARNING: Avoid using the Redis `KEYS` command in production.
   *
   * This command performs a full scan of the keyspace and can severely
   * impact Redis performance, especially on large datasets.
   *
   * @deprecated Not recommended for production usage.
   */
  public getAllKeysWithPattern(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  public getRedisValueWithKey(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  /**
   * Only work if value is string type
   */
  public getValueAndDeleteKey(key: string): Promise<string> {
    return this.redisClient.getDel(key);
  }

  public setRedisData(key: string, value: string): unknown {
    return this.redisClient.set(key, value);
  }

  public setRedisDataWithExpireTime({ key, value, expireTime } : { key: string, value: string, expireTime: number }): void {
    this.setRedisData(key, value);
    this.setExpireKey(key, expireTime);
  }

  public async getResetPasswordRemainingTimes(email: string): Promise<number> {
    const key = `${RedisConstants.RESET_PASSWORD_ATTEMPT_REMAINS}${email}`;
    const result = await this.redisClient.exists(key);
    return result
      ? Number(await this.getRedisValueWithKey(key))
      : Number(this.environmentService.getByKey(EnvConstants.DAILY_RESET_PASSWORD_LIMIT));
  }

  public setResetPasswordRemainingTimes(email: string): void {
    const key = `${RedisConstants.RESET_PASSWORD_ATTEMPT_REMAINS}${email}`;
    this.redisClient.exists(key).then((res) => {
      try {
        if (res) {
          this.redisClient.decr(key);
        } else {
          const dailyResetLimit = Number(this.environmentService.getByKey(EnvConstants.DAILY_RESET_PASSWORD_LIMIT));
          this.redisClient.set(key, dailyResetLimit - 1);
          this.redisClient.expire(key, Number(this.environmentService.getByKey(EnvConstants.CAN_RESET_PASSWORD_AFTER)));
        }
      } catch (error) {
        throw Error(error as string);
      }
    });
  }

  public revokePermission(revokeKey: string): boolean {
    this.redisClient.set(revokeKey, 'revoke');
    this.redisClient.expire(revokeKey, CommonConstants.REVOKE_PERMISSION_IN);
    return true;
  }

  public addAccessTokenToBlacklist(token: string): void {
    const key = `${RedisConstants.TOKEN_BLACK_LIST_PREFIX}${token}`;
    this.redisClient.set(key, 'invalid');
    this.redisClient.expire(key, CommonConstants.ADMIN_ACCESS_TOKEN_EXPIRE_IN);
  }

  public async validateToken(token: string): Promise<boolean> {
    const key = `${RedisConstants.TOKEN_BLACK_LIST_PREFIX}${token}`;
    const result = await this.redisClient.get(key);
    if (result === 'invalid') {
      return false;
    }
    return true;
  }

  public async checkKeyBlackList(key: string): Promise<any> {
    const result = await this.redisClient.get(key);
    return result;
  }

  public saveAnnotationsTemp(documentId: string, xPDF: string): boolean {
    this.redisClient.set(documentId, xPDF);
    return true;
  }

  public async getAnnotationsTemp(documentId: string) {
    const result = await this.redisClient.get(documentId);
    return result;
  }

  public addOrgToDelete(orgId: string) {
    this.redisClient.get('OrganizationsToDelete').then((res: string) => {
      const orgs = res ? JSON.parse(res) : [];
      orgs.push({ orgId, date: new Date().getTime() });
      this.redisClient.set('OrganizationsToDelete', JSON.stringify(orgs));
    });
  }

  public async removeOrgsToDelete(orgIds: string[]): Promise<boolean> {
    const result: string = await this.redisClient.get('OrganizationsToDelete');
    if (!result) {
      return false;
    }
    let organizations: Array<any> = JSON.parse(result);
    organizations = organizations.filter(({ orgId }: { orgId: string }) => !orgIds.includes(orgId));
    if (organizations.length) {
      this.redisClient.set('OrganizationsToDelete', JSON.stringify(organizations));
    } else {
      this.redisClient.del('OrganizationsToDelete');
    }
    return true;
  }

  public async addUserToDelete(userId: string) {
    const result: string = await this.redisClient.get('AccountToDelete');
    let users = [];
    if (result) {
      users = JSON.parse(result);
    }
    users.push({ userId, date: new Date().getTime() });
    this.redisClient.set('AccountToDelete', JSON.stringify(users));
    return users;
  }

  public async getUsersToDelete(): Promise<UserDelete[]> {
    const result: string = await this.redisClient.get('AccountToDelete');
    if (result) {
      const users = JSON.parse(result) as UserDelete[];
      return users;
    }
    return [];
  }

  public async removeUsersToDelete(userIds: string[]) {
    const result: string = await this.redisClient.get('AccountToDelete');
    if (result) {
      let users = JSON.parse(result);
      users = users.filter((user) => !userIds.includes(user.userId as string));
      this.redisClient.set('AccountToDelete', JSON.stringify(users));
      return true;
    }
    return [];
  }

  public async deleteRedisByKey(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);
    return Boolean(result);
  }

  public async setRefreshToken(userId: string, token: string): Promise<void> {
    if (!userId) {
      return;
    }
    try {
      const result: string = await this.redisClient.get(`token-${userId}`);
      const [time, unit] = this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN).split(' ');
      const expireIn = moment.duration(time, unit as moment.DurationInputArg2).asSeconds();
      if (result) {
        const tokens = JSON.parse(result);
        tokens.push(token);
        this.redisClient.set(`token-${userId}`, JSON.stringify(tokens));
        this.redisClient.expire(`token-${userId}`, expireIn);
      } else {
        this.redisClient.set(`token-${userId}`, JSON.stringify([token]));
        this.redisClient.expire(`token-${userId}`, expireIn);
      }
    } catch (error) {}
  }

  public async setAdminAccessToken(adminId: string, token: string): Promise<boolean> {
    const redisKey = `${RedisConstants.ADMIN_ACCESS_TOKENS_PREFIX}${adminId}`;
    const result: string = await this.redisClient.get(redisKey);
    try {
      const data = JSON.parse(result);
      const tokens = data ? [...data, token] : [token];
      this.redisClient.set(redisKey, JSON.stringify(tokens));
      this.redisClient.expire(redisKey, CommonConstants.ADMIN_ACCESS_TOKEN_EXPIRE_IN);
    } catch (err) {}
    return true;
  }

  public async checkRefreshToken(userId: string, token: string): Promise<boolean> {
    const result: string = await this.redisClient.get(`token-${userId}`);
    if (!result) {
      return false;
    }
    const tokens = JSON.parse(result);
    return tokens.some((val) => val === token);
  }

  public async removeRefreshToken(userId: string, token: string): Promise<boolean> {
    const result: string = await this.redisClient.get(`token-${userId}`);
    if (!result) {
      return false;
    }
    let tokens = JSON.parse(result);
    tokens = tokens.filter((val) => val !== token);
    const [time, unit] = this.environmentService.getByKey(EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN).split(' ');
    const expireIn = moment.duration(time, unit as moment.DurationInputArg2).asSeconds();
    if (tokens.length) {
      this.redisClient.set(`token-${userId}`, JSON.stringify(tokens));
      this.redisClient.expire(`token-${userId}`, expireIn);
    } else {
      this.deleteRedisByKey(`token-${userId}`);
    }
    return true;
  }

  public async deleteAdminToken(userId: string, token: string): Promise<void> {
    const redisKey = `${RedisConstants.ADMIN_ACCESS_TOKENS_PREFIX}${userId}`;
    const res: string = await this.redisClient.get(redisKey);
    if (!res) {
      return;
    }
    let tokens = JSON.parse(res);
    if (tokens?.length) {
      tokens = tokens.filter((val) => val !== token);
      this.redisClient.set(redisKey, JSON.stringify(tokens));
    }
  }

  public clearAllRefreshToken(userId: string): boolean {
    return Boolean(this.redisClient.del(`token-${userId}`));
  }

  public clearAdminToken(admin: string): boolean {
    return Boolean(this.redisClient.del(`${RedisConstants.ADMIN_ACCESS_TOKENS_PREFIX}${admin}`));
  }

  /**
   * @deprecated
   * Remove this after migrating to new document sync service
   * Keep this for backward compatibility
   */
  public removeDocumentIsSyncing(documentId: string): boolean {
    return Boolean(this.redisClient.del(`sync-${documentId}`));
  }

  public async getChannelOnlineMembers(roomId: string): Promise<ChannelMember[]> {
    const roomName = `document-room-${roomId}-members`;
    const result: string = await this.redisClient.get(roomName);
    if (result) {
      return JSON.parse(result) as ChannelMember[];
    }
    return [];
  }

  public async removeChannelOnlineMembers(roomId: string, user): Promise<ChannelMember[]> {
    const roomName = `document-room-${roomId}-members`;
    const result: string = await this.redisClient.get(roomName);
    if (result) {
      const members = JSON.parse(result);
      const newMembers = members?.filter((m) => m?.socketId !== user?.socketId) as ChannelMember[];
      if (newMembers) {
        if (newMembers.length > 0) {
          this.redisClient.set(roomName, JSON.stringify(newMembers));
          this.redisClient.expire(roomName, 24 * 3600);
        } else {
          this.deleteRedisByKey(`document-room-${roomId}-members`);
        }
      }
      return newMembers || [];
    }
    return [];
  }

  public async addChannelOnlineMembers(roomId: string, member) {
    const roomName = `document-room-${roomId}-members`;
    const members: any = await this.getChannelOnlineMembers(roomId);
    const newMembers = [...members, member].filter(Boolean);
    const hashedMembers = {};
    const onlineMembers = [];
    for (let i = 0; i < newMembers.length; i++) {
      if (hashedMembers[newMembers[i].socketId]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      hashedMembers[newMembers[i].socketId] = true;
      onlineMembers.push(newMembers[i]);
    }
    this.redisClient.set(roomName, JSON.stringify(onlineMembers));
    this.redisClient.expire(roomName, 24 * 3600);
  }

  public async updateOnlineMember(roomId: string, memberId: string, data: ChannelMember) {
    const roomName = `document-room-${roomId}-members`;
    const members = await this.getChannelOnlineMembers(roomId);
    const updateMembers = members.map((member) => {
      if (member?._id === memberId) {
        return {
          ...member,
          ...data,
        };
      }
      return member;
    });
    this.redisClient.set(roomName, JSON.stringify(updateMembers));
    this.redisClient.expire(roomName, 24 * 3600);
  }

  public getKeyTTL(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  public setExpireKey(key: string, timeExpired: number) {
    this.redisClient.expire(key, timeExpired);
  }

  public async getUserFailedAttempt(email: string): Promise<number> {
    const key = `attempt-${email}`;
    const result = await this.redisClient.get(key);
    return Number(result);
  }

  public async getAdminFailedAttempt(email: string): Promise<number> {
    const key = `${RedisConstants.ADMIN_SIGN_IN_ATTEMPT_PREFIX}${email}`;
    return this.getRedisValueWithKey(key)
      .then((attempts) => Number(attempts))
      .catch((error) => {
        throw error;
      });
  }

  public async setUserFailedAttempt(email: string, isAdmin?: boolean): Promise<void> {
    const keyPrefix = isAdmin
      ? RedisConstants.ADMIN_SIGN_IN_ATTEMPT_PREFIX
      : RedisConstants.USER_SIGN_IN_ATTEMPT_PREFIX;
    const key = `${keyPrefix}${email}`;
    await Promise.all([
      this.redisClient.incr(key),
      this.redisClient.expire(key, 1800),
    ]);
  }

  public setMailReminderSubscriptionExpired({ orgId, timeOffset, timeSubscriptionWillExpired }: SetMailReminderSubscriptionExpiredInput): void {
    const timeStampSubExpired = moment(timeSubscriptionWillExpired, 'DD MMM YYYY').unix();
    const remindSubscriptionExpiredKey = `remind-subscription-expired:${timeOffset}:${orgId}:${timeStampSubExpired}`;
    const timeRedisKeyExpired = moment(timeSubscriptionWillExpired, 'DD MMM YYYY').subtract(timeOffset, 'days').diff(moment(), 'seconds');
    this.setRedisData(remindSubscriptionExpiredKey, '1');
    this.redisClient.expire(remindSubscriptionExpiredKey, timeRedisKeyExpired);
  }

  public setKeyIfNotExist(key: string, value : string, expire: string) {
    return this.redisClient.sendCommand(['SET', key, value, 'PX', expire, 'NX']);
  }

  public setTransferOrgAdmin(orgId: string, grantedEmail: string) : void {
    const transformOrgAdminKey = `${RedisConstants.TRANSFER_ORG_ADMIN}:${orgId}`;
    this.setRedisData(transformOrgAdminKey, grantedEmail);
    const expireTime = Number(this.environmentService.getByKey(EnvConstants.EXPIRE_TRANSFER_ORG_OWNERSHIP));
    this.redisClient.expire(transformOrgAdminKey, expireTime);
  }

  public setDocumentStat(clientId: string, documentStat: Partial<IDocumentInsight>): void {
    this.redisClient.set(`${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${clientId}`, JSON.stringify(documentStat));
    this.redisClient.expire(
      `${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${clientId}`,
      Number(this.environmentService.getByKey(EnvConstants.DOCUMENT_STAT_EXPIRE_IN)),
    );
  }

  public setNonDocumentStat(clientId: string, stat: INonDocumentStat): void {
    this.redisClient.set(`${RedisConstants.NON_DOCUMENT_STAT_REDIS_PREFIX}${clientId}`, JSON.stringify(stat));
    this.redisClient.expire(
      `${RedisConstants.NON_DOCUMENT_STAT_REDIS_PREFIX}${clientId}`,
      Number(this.environmentService.getByKey(EnvConstants.NON_DOCUMENT_STAT_EXPIRE_IN)),
    );
  }

  public setSubscriptionActor(subscription: string, actorId: string): void {
    this.redisClient.set(`${RedisConstants.SUBSCRIPTION_ACTOR_REDIS_PREFIX}${subscription}`, actorId);
    this.redisClient.expire(
      `${RedisConstants.SUBSCRIPTION_ACTOR_REDIS_PREFIX}${subscription}`,
      Number(this.environmentService.getByKey(EnvConstants.SUBSCRIPTION_ACTOR_EXPIRE_IN)),
    );
  }

  public removeDocumentStat(clientId: string): void {
    this.redisClient.del(`${RedisConstants.DOCUMENT_STAT_REDIS_PREFIX}${clientId}`);
  }

  public removeNonDocumentStat(clientId: string): void {
    this.redisClient.del(`${RedisConstants.NON_DOCUMENT_STAT_REDIS_PREFIX}${clientId}`);
  }

  public getRateLimitTTL(operationName: string, strategy: string): Promise<number> {
    const key = `${RedisConstants.RATE_LIMIT_PREFIX}${operationName}:${strategy}`;
    return this.redisClient.ttl(key);
  }

  public setRateLimitEndpoint(operationName: string, strategy: string, limit: RATE_LIMITER_LIMIT, expire: number): void {
    const key = `${RedisConstants.RATE_LIMIT_PREFIX}${operationName}:${strategy}`;
    this.redisClient.set(key, JSON.stringify(limit));
    this.redisClient.expire(key, expire);
  }

  public async getRateLimitEndpoint(operationName: string, strategy: string): Promise<RATE_LIMITER_LIMIT> {
    const result: string = await this.redisClient.get(`${RedisConstants.RATE_LIMIT_PREFIX}${operationName}:${strategy}`);
    return JSON.parse(result) as RATE_LIMITER_LIMIT;
  }

  public setUploadFileLimit(input: {
    uploader: User,
    totalUploaded: number,
    resourceId: string,
    baseKey: string,
  }): void {
    const {
      uploader, totalUploaded, resourceId, baseKey,
    } = input;
    const sharerId = uploader._id;
    const expireTime = this.getTimestampToResetLimit(uploader.timezoneOffset);
    const key = `${baseKey}${sharerId}:${resourceId}`;
    this.redisClient.exists(key).then((result) => {
      if (result) {
        this.redisClient.incrBy(key, totalUploaded);
      } else {
        this.redisClient.set(key, totalUploaded);
        this.redisClient.expire(key, expireTime);
      }
    });
  }

  getTimestampToResetLimit(timezoneOffset: number): number {
    const currentLocalTime = moment().utcOffset(-timezoneOffset);
    const endOfDayLocalTime = moment().endOf('day').utcOffset(-timezoneOffset);
    return endOfDayLocalTime.diff(currentLocalTime, 'second');
  }

  public async removeTeamData(teamId: string) : Promise<void> {
    const pattern = `IN:*:${teamId}`;
    const keys = await this.getKeys(pattern);
    keys.forEach((key) => this.redisClient.del(key));

    // get all pending email in this team;
    const teamEmails = await this.getAllHsetData(`INS:${teamId}`);
    const emails = teamEmails.map(({ key }) => key);
    this.redisClient.del(`INS:${teamId}`);
    await Promise.all(emails.map((email) => this.removeKeyFromhset(`INS:${email}`, teamId)));
  }

  public setValidVerifyToken(email: string, tokenVerifyAccount: string): void {
    const key = `${RedisConstants.VALID_VERIFY_TOKEN_PREFIX}${email}`;
    this.setRedisData(key, tokenVerifyAccount);
    this.setExpireKey(key, Number(this.environmentService.getByKey(EnvConstants.EXPIRE_VERIFY_TOKEN)));
    this.setTempKeyPreventSpamVerifyEmail(email);
  }

  public async getValidVerifyToken(email: string): Promise<string> {
    const key = `${RedisConstants.VALID_VERIFY_TOKEN_PREFIX}${email}`;
    return this.getRedisValueWithKey(key);
  }

  public setResetPasswordToken(email: string, token: string): void {
    const key = `${RedisConstants.RESET_PASSWORD_TOKEN_PREFIX}${email}`;
    this.setRedisData(key, token);
    this.setExpireKey(key, Number(this.environmentService.getByKey(EnvConstants.RESET_PASSWORD_TOKEN_EXPIRE_IN)));
  }

  public setAdminResetPasswordToken(email: string, token: string): void {
    const key = `${RedisConstants.ADMIN_RESET_PASSWORD_TOKEN_PREFIX}${email}`;
    this.setRedisData(key, token);
    this.setExpireKey(key, Number(this.environmentService.getByKey(EnvConstants.RESET_PASSWORD_TOKEN_EXPIRE_IN)));
  }

  public setAdminCreatePasswordToken(email: string, token: string): void {
    const key = `${RedisConstants.ADMIN_CREATE_PASSWORD_TOKEN_PREFIX}${email}`;
    this.setRedisData(key, token);
    this.setExpireKey(key, Number(this.environmentService.getByKey(EnvConstants.CREATE_PASSWORD_TOKEN_EXPIRE_IN)));
  }

  public deleteResetPasswordToken(email: string): void {
    this.redisClient.del(`${RedisConstants.RESET_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public deleteAdminResetPasswordToken(email: string): void {
    this.redisClient.del(`${RedisConstants.ADMIN_RESET_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public deleteAdminCreatePasswordToken(email: string): void {
    this.redisClient.del(`${RedisConstants.ADMIN_CREATE_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public getResetPasswordToken(email:string): Promise<string> {
    return this.getRedisValueWithKey(`${RedisConstants.RESET_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public getAdminResetPasswordToken(email:string): Promise<string> {
    return this.getRedisValueWithKey(`${RedisConstants.ADMIN_RESET_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public getAdminCreatePasswordToken(email:string): Promise<string> {
    return this.getRedisValueWithKey(`${RedisConstants.ADMIN_CREATE_PASSWORD_TOKEN_PREFIX}${email}`);
  }

  public delValidVerifyToken(email: string): void {
    const key = `${RedisConstants.VALID_VERIFY_TOKEN_PREFIX}${email}`;
    this.redisClient.del(key);
  }

  public setTempKeyPreventSpamVerifyEmail(email: string): void {
    this.setRedisData(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`, 'true');
    this.setExpireKey(`${RedisConstants.VERIFY_EMAIL_SENT}${email}`, 60);
  }

  public setStripeRenewAttempt(attemptObj: IStripeRenewAttempt): void {
    const key = `${RedisConstants.STRIPE_RENEW_ATTEMPT}${attemptObj.clientId}`;
    this.setRedisData(key, JSON.stringify(attemptObj));
    this.setExpireKey(key, Number.parseInt(this.environmentService.getByKey(EnvConstants.TOTAL_TIME_TO_RENEW)));
  }

  public async getRenewAttempt(clientId: string): Promise<IStripeRenewAttempt> {
    const value = await this.getRedisValueWithKey(`${RedisConstants.STRIPE_RENEW_ATTEMPT}${clientId}`);

    return JSON.parse(value);
  }

  public removeStripeRenewAttempt(clientId: string): Promise<boolean> {
    return this.deleteRedisByKey(`${RedisConstants.STRIPE_RENEW_ATTEMPT}${clientId}`);
  }

  setCanceledSubWarning(clientId: string, userIds: string[]): void {
    const key = `${RedisConstants.STRIPE_FAILED_ALL_ATTEMPTS}${clientId}`;
    userIds.forEach((userId) => {
      this.setHsetData(key, userId, '1');
    });
  }

  removeUserInCanceledSubWarning(clientId: string, userId: string): Promise<boolean> {
    const key = `${RedisConstants.STRIPE_FAILED_ALL_ATTEMPTS}${clientId}`;
    return this.removeKeyFromhset(key, userId);
  }

  removeCancelSubscriptionWarning(clientId: string): Promise<boolean> {
    const key = `${RedisConstants.STRIPE_FAILED_ALL_ATTEMPTS}${clientId}`;
    return this.deleteRedisByKey(key);
  }

  async checkUserInCanceledSubWarning(clientId: string, userId: string): Promise<boolean> {
    const key = `${RedisConstants.STRIPE_FAILED_ALL_ATTEMPTS}${clientId}`;
    const value = await this.getValueFromHset(key, userId);
    return Boolean(value);
  }

  public setInvitationSignUp(email: string, orgId: string): void {
    const key = `${RedisConstants.INVITATION_SIGN_UP_PREFIX}${email}`;
    this.setRedisData(key, orgId);
    this.setExpireKey(key, CommonConstants.INVITATION_SIGN_UP_EXPIRE_IN);
  }

  public async checkUserSignUpWithInvite(email: string): Promise<string> {
    const orgInvitedId = await this.getRedisValueWithKey(`${RedisConstants.INVITATION_SIGN_UP_PREFIX}${email}`);
    return orgInvitedId;
  }

  setDisableSubscriptionRemainingBanner(
    { targetId, userId, dayOffset } : {targetId: string, userId: string, dayOffset: number },
  ): void {
    const key = `${RedisConstants.STRIPE_DISABLE_SUBSCRIPTION_REMAINING_DATE}:${targetId}`;
    this.setHsetData(key, userId, dayOffset.toString());
  }

  getDisableSubscriptionRemainingBanner({ targetId, userId } : { targetId: string, userId: string }): Promise<any> {
    const key = `${RedisConstants.STRIPE_DISABLE_SUBSCRIPTION_REMAINING_DATE}:${targetId}`;
    return this.getValueFromHset(key, userId);
  }

  removeDisableSubscriptionRemainingBanner(targetId: string): Promise<boolean> {
    const key = `${RedisConstants.STRIPE_DISABLE_SUBSCRIPTION_REMAINING_DATE}:${targetId}`;
    return this.deleteRedisByKey(key);
  }

  setDocViewerInteractionValue(data: {
    type: DocViewerInteractionType
    userId: string,
    value: number,
  }): void {
    const { type, userId, value } = data;
    const key = `${RedisConstants.DOC_VIEWER_INTERACTION_PREFIX}${userId}`;
    let redisField: string;
    switch (type) {
      case DocViewerInteractionType.TOTAL_OPENED_DOC:
        redisField = RedisConstants.TOTAL_OPENED_DOC_FIELD;
        break;
      case DocViewerInteractionType.TOTAL_CREATED_ANNOTATION:
        redisField = RedisConstants.TOTAL_CREATED_ANNOT_FIELD;
        break;
      default:
        break;
    }
    this.setHsetData(key, redisField, String(value));
    this.setExpireKey(key, CommonConstants.USER_DOC_VIEWER_INTERACTION_EXPIRE_IN);
  }

  /**
   * @deprecated
   */
  async getDocViewerInteraction(userId: string): Promise<Record<string, number>> {
    const key = `${RedisConstants.DOC_VIEWER_INTERACTION_PREFIX}${userId}`;
    const data = await this.getAllHsetData(key);
    return data.reduce((prevData, { key: field, value }) => ({
      ...prevData,
      [field]: value,
    }), {});
  }

  removeDocViewerInteraction(userId: string): void {
    const key = `${RedisConstants.DOC_VIEWER_INTERACTION_PREFIX}${userId}`;
    this.redisClient.del(key);
  }

  async getContactPool(): Promise<(Partial<IActiveContact> & { email: IActiveContact['email'] }) []> {
    const data = await this.getAllHsetData(RedisConstants.CONTACT_POOL);
    return data.map(({ value }) => JSON.parse(value as string));
  }

  async pushToPool(contact): Promise<void> {
    const value: any = await this.getValueFromHset(RedisConstants.CONTACT_POOL, contact.email as string);
    const oldContact = JSON.parse(value as string);
    const newContact = oldContact ? {
      email: contact.email,
      properties: {
        ...oldContact.properties,
        ...contact.properties,
      },
    } : contact;
    this.setHsetData(RedisConstants.CONTACT_POOL, newContact.email as string, JSON.stringify(newContact));
  }

  deleteHashFields(key: string, fields: string[]): Promise<number> {
    if (!fields || !fields.length) {
      return Promise.resolve(0);
    }
    return this.redisClient.hDel(key, fields);
  }

  setSetupIntent({
    userId,
    setupIntentId,
    status,
    stripeAccountId,
  }: {
    userId: string,
    setupIntentId: string,
    status: IntentStatus
    stripeAccountId: string,
  }): void {
    const key = `${RedisConstants.STRIPE_SETUP_INTENT_PREFIX}${userId}:${stripeAccountId}`;
    this.setHsetData(key, setupIntentId, status);
    this.redisClient.expire(key, Number(this.environmentService.getByKey(EnvConstants.EXPIRE_SETUP_INTENT)));
  }

  async getSetupIntent(userId: string, stripeAccountId: string): Promise<string> {
    const hsetKey = `${RedisConstants.STRIPE_SETUP_INTENT_PREFIX}${userId}:${stripeAccountId}`;
    const hset = await this.getAllHsetData(hsetKey);
    const { key } = hset.find((item) => item.value === IntentStatus.ACTIVE) || {};
    return key;
  }

  setOrganizationSetupIntent(orgId: string, stripeAccountId: string, setupIntentValue: any): void {
    const key = this.getOrganizationSetupIntentKey(orgId, stripeAccountId);
    this.setRedisDataWithExpireTime({
      key,
      value: setupIntentValue,
      expireTime: Number(this.environmentService.getByKey(EnvConstants.EXPIRE_SETUP_INTENT)),
    });
  }

  async getOrganizationSetupIntent(orgId: string, stripeAccountId: string): Promise<string> {
    const key = this.getOrganizationSetupIntentKey(orgId, stripeAccountId);
    return this.getRedisValueWithKey(key);
  }

  async removeOrganizationSetupIntent(orgId: string, stripeAccountId: string): Promise<boolean> {
    const key = this.getOrganizationSetupIntentKey(orgId, stripeAccountId);
    return this.deleteRedisByKey(key);
  }

  private getOrganizationSetupIntentKey(orgId: string, stripeAccountId: string): string {
    return `${RedisConstants.ORGANIZATION_STRIPE_SETUP_INTENT_PREFIX}${orgId}:${stripeAccountId}`;
  }

  deleteFreeTrialSetupIntent(userId: string, setupIntentId: string): Promise<boolean> {
    const hsetKey = `${RedisConstants.STRIPE_SETUP_INTENT_PREFIX}${userId}`;
    return this.removeKeyFromhset(hsetKey, setupIntentId);
  }

  setResentOrgInvitation(invitationId: string): void {
    const key = `${RedisConstants.RESENT_ORGANIZATION_INVITATION}${invitationId}`;
    this.setRedisData(key, 'true');
    this.setExpireKey(key, Number(this.environmentService.getByKey(EnvConstants.RESEND_ORGANIZATION_INVITATION_EXPIRE_TIME)));
  }

  async hasSentOrgInvitation(invitationId: string): Promise<{value: string, ttl: number}> {
    const key = `${RedisConstants.RESENT_ORGANIZATION_INVITATION}${invitationId}`;
    const redisValue = await this.getRedisValueWithKey(key);
    const ttl = await this.getKeyTTL(key);
    return { value: redisValue, ttl };
  }

  appendUserPricingMigration(params: {
    userId: string,
    orgId: string,
    result?: Partial<DocumentMigrationResult>,
    error?: Error,
  }): void {
    const {
      userId, orgId, result, error,
    } = params;
    const payload: IPricingUserMigration = {
      ...result,
      orgId,
      migratedAt: new Date(),
      error: error?.message,
    };
    this.setHsetData(RedisConstants.PRICING_USER_MIGRATION, userId, JSON.stringify(payload));
  }

  setStripeRefundFraudWarning(customerId: string, refundedAmount: string): void {
    const key = `${RedisConstants.STRIPE_REFUND_FRAUD_WARNING_CUSTOMER}${customerId}`;
    // This key will be cleared when received subscription deleted hook. Set expire time to make sure that key isn't existed forever
    const expireTime = 86400 * 30;
    this.setRedisData(key, refundedAmount);
    this.setExpireKey(key, expireTime);
  }

  async refundedFraudWarningAmount(customerId: string): Promise<string> {
    const key = `${RedisConstants.STRIPE_REFUND_FRAUD_WARNING_CUSTOMER}${customerId}`;
    const redisValue = await this.getRedisValueWithKey(key);
    if (redisValue) {
      this.deleteRedisByKey(key);
    }
    return redisValue;
  }

  setMainSubscriptionItemId(subscriptionId: string, itemId: string): void {
    const key = `${RedisConstants.STRIPE_MAIN_SUBSCRIPTION_ITEM}${subscriptionId}`;
    const expireTime = 3600;
    this.setRedisData(key, itemId);
    this.setExpireKey(key, expireTime);
  }

  deleteMainSubscriptionItemId(subscriptionId: string): void {
    const key = `${RedisConstants.STRIPE_MAIN_SUBSCRIPTION_ITEM}${subscriptionId}`;
    this.deleteRedisByKey(key);
  }

  async getMainSubscriptionItemId(subscriptionId: string): Promise<string> {
    const key = `${RedisConstants.STRIPE_MAIN_SUBSCRIPTION_ITEM}${subscriptionId}`;
    return this.getRedisValueWithKey(key);
  }

  setMigratedOrganizationUrl(userId: string, orgUrl: string): void {
    const key = `${RedisConstants.MIGRATED_ORG_URL_PREFIX}${userId}`;
    // This field will be clear when user access to migrated org and click got it in inform modal
    const expireTime = 86400 * 30 * 3;
    this.setRedisDataWithExpireTime({ key, value: orgUrl, expireTime });
  }

  async getMigratedOrgUrl(userId: string): Promise<string> {
    const key = `${RedisConstants.MIGRATED_ORG_URL_PREFIX}${userId}`;
    return this.getRedisValueWithKey(key);
  }

  public setValidInviteToken(email: string, orgId: string, inviteToken: string): void {
    const key = `${RedisConstants.VALID_INVITE_ORG_TOKEN_PREFIX}${email}-${orgId}`;
    const expireTime = Number(this.environmentService.getByKey(EnvConstants.INVITE_TO_ORG_TOKEN_EXPIRE));
    this.setRedisDataWithExpireTime({ key, value: inviteToken, expireTime });
  }

  public async getValidInviteToken(email: string, orgId: string): Promise<string> {
    const key = `${RedisConstants.VALID_INVITE_ORG_TOKEN_PREFIX}${email}-${orgId}`;
    return this.getRedisValueWithKey(key);
  }

  public async removeInviteToken(email: string, orgId: string): Promise<boolean> {
    const key = `${RedisConstants.VALID_INVITE_ORG_TOKEN_PREFIX}${email}-${orgId}`;
    return this.deleteRedisByKey(key);
  }

  public setDeleteBackupFileExpired(orgId : string): void {
    const remindSubscriptionExpiredKey = `${RedisConstants.DELETE_BACKUP_FILES}${orgId}`;
    this.setRedisData(remindSubscriptionExpiredKey, '1');
    const ORIGINAL_VERSION_EXPIRE_TIME = Number(this.environmentService.getByKey(EnvConstants.ORIGINAL_VERSION_EXPIRE_TIME));

    const ORIGINAL_VERSION_EXPIRE_TIME_UNIT = this.environmentService.getByKey(EnvConstants.ORIGINAL_VERSION_EXPIRE_TIME_UNIT);
    const expireTime = moment.duration(ORIGINAL_VERSION_EXPIRE_TIME, ORIGINAL_VERSION_EXPIRE_TIME_UNIT as moment.unitOfTime.Base).as('seconds');
    this.redisClient.expire(remindSubscriptionExpiredKey, expireTime);
  }

  public async savePinpointEvents(eventsReq: PutEventsRequest): Promise<number> {
    return this.rightPush(RedisConstants.PINPOINT_EVENTS, JSON.stringify(eventsReq));
  }

  public setOpenFormFromTemplates(params: { userId: string, formRemoteId: number, source: string }): void {
    const { userId, formRemoteId, source } = params;
    const key = `${RedisConstants.OPEN_FORM_FROM_TEMPLATES}${userId}`;
    let url;
    if (source) {
      url = `/open-form?remoteId=${formRemoteId}&from=templates&source=${source}`;
    } else {
      url = `/open-form?remoteId=${formRemoteId}&from=templates`;
    }
    this.setRedisDataWithExpireTime({
      key, value: url, expireTime: Number(this.environmentService.getByKey(EnvConstants.OPEN_FORM_FROM_TEMPLATES_EXPIRE_TIME)),
    });
  }

  public async getOpenFormFromTemplates(userId: string): Promise<string> {
    const key = `${RedisConstants.OPEN_FORM_FROM_TEMPLATES}${userId}`;
    const result = await this.getRedisValueWithKey(key);
    return result;
  }

  public async deleteOpenFormFromTemplates(userId: string): Promise<boolean> {
    const key = `${RedisConstants.OPEN_FORM_FROM_TEMPLATES}${userId}`;
    return this.deleteRedisByKey(key);
  }

  public async hasIdentityDeletedRecently(identityId: string): Promise<string> {
    const key = `${RedisConstants.IDENTITY_DELETED_RECENTLY}${identityId}`;
    return this.getRedisValueWithKey(key);
  }

  /**
    * Temporary save recently deleted identity
    * to prevent accidentally create new account
    * when using the existing token
  */
  public setIdentityDeletedRecently(identityId: string): void {
    const key = `${RedisConstants.IDENTITY_DELETED_RECENTLY}${identityId}`;
    const expireTime = Number(this.environmentService.getByKey(EnvConstants.JWT_AUTHORIZATION_EXPIRE_IN));
    this.setRedisDataWithExpireTime({ key, value: 'true', expireTime });
  }

  public setCredentialsFromOpenGoogle(flowId: string, ipAddress: string, data: CredentialsFromOpenGooglePayload): void {
    const key = `${RedisConstants.OPEN_GOOGLE_CREDENTIALS}${flowId}:${ipAddress}`;
    const expireTime = CommonConstants.OPEN_GOOGLE_CREDENTIALS_EXPIRE_IN;
    this.setRedisDataWithExpireTime({ key, value: JSON.stringify(data), expireTime });
  }

  public async getCredentialsFromOpenGoogle(flowId: string, ipAddress: string): Promise<CredentialsFromOpenGooglePayload> {
    const key = `${RedisConstants.OPEN_GOOGLE_CREDENTIALS}${flowId}:${ipAddress}`;
    const data = await this.getValueAndDeleteKey(key);
    return JSON.parse(data);
  }

  public async isOrgRecentlyUpgradedByAdmin(orgId: string): Promise<boolean> {
    const key = `${RedisConstants.ORG_RECENTLY_UPGRADED_BY_ADMIN}:${orgId}`;
    return Boolean(await this.getValueAndDeleteKey(key));
  }

  public setOrgRecentlyUpgradedByAdmin(orgId: string): void {
    const key = `${RedisConstants.ORG_RECENTLY_UPGRADED_BY_ADMIN}:${orgId}`;
    const expireTime = CommonConstants.ORG_RECENTLY_UPGRADED_BY_ADMIN_EXPIRE_IN;
    this.setRedisDataWithExpireTime({ key, value: '1', expireTime });
  }

  public getLastChangedAnnotationKey(documentId: string): string {
    return `${RedisConstants.LAST_CHANGED_ANNOTATION}:${documentId}`;
  }

  public setLastChangedAnnotation(documentId: string) {
    const key = this.getLastChangedAnnotationKey(documentId);
    const expireTime = CommonConstants.LAST_CHANGED_ANNOTATION_EXPIRE_IN;
    const value = new Date().toISOString();
    this.setRedisDataWithExpireTime({ key, value, expireTime });
  }

  public async getLastChangedAnnotation(documentId: string): Promise<Date | null> {
    const key = this.getLastChangedAnnotationKey(documentId);
    const result = await this.getRedisValueWithKey(key);
    return result ? new Date(result) : null;
  }

  public renewLastChangedAnnotationExpire(documentId: string) {
    const key = this.getLastChangedAnnotationKey(documentId);
    const expireTime = CommonConstants.LAST_CHANGED_ANNOTATION_EXPIRE_IN;
    this.setExpireKey(key, expireTime);
  }

  public setExtraTrialDaysOrganizationInfo(orgId: string, action: ExtraTrialDaysOrganizationAction, data: IExtraTrialDaysOrganization): void {
    const key = `${RedisConstants.EXTRA_TRIAL_DAYS}${orgId}:${action}`;
    const expireTime = CommonConstants.EXTRA_TRIAL_DAYS_EXPIRE_IN;
    this.setRedisDataWithExpireTime({ key, value: JSON.stringify(data), expireTime });
  }

  public async getExtraTrialDaysOrganizationInfo(orgId: string, action: ExtraTrialDaysOrganizationAction): Promise<IExtraTrialDaysOrganization> {
    const key = `${RedisConstants.EXTRA_TRIAL_DAYS}${orgId}:${action}`;
    const data = await this.getRedisValueWithKey(key);
    return JSON.parse(data);
  }

  public async deleteExtraTrialDaysOrganizationInfo(orgId: string, action: ExtraTrialDaysOrganizationAction): Promise<boolean> {
    const key = `${RedisConstants.EXTRA_TRIAL_DAYS}${orgId}:${action}`;
    return this.deleteRedisByKey(key);
  }

  public setDomainUseAlternativeQuery(domain: string): void {
    const key = `${RedisConstants.DOMAIN_USE_ALTERNATIVE_QUERY}${domain}`;
    this.setRedisDataWithExpireTime({ key, value: '1', expireTime: CommonConstants.DOMAIN_ALTERNATIVE_QUERY_EXPIRE_IN });
  }

  public async isDomainUseAlternativeQuery(domain: string): Promise<boolean> {
    const key = `${RedisConstants.DOMAIN_USE_ALTERNATIVE_QUERY}${domain}`;
    return Boolean(await this.getRedisValueWithKey(key));
  }

  public async increase(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  public setSubscriptionCanceledDate({ orgId, value }: { orgId: string, value: number }): void {
    const key = `${RedisConstants.SUBSCRIPTION_CANCELED_DATE}${orgId}`;
    const expireTime = CommonConstants.SUBSCRIPTION_CANCELED_DATE_EXPIRE_IN;
    this.setRedisDataWithExpireTime({ key, value: String(value), expireTime });
  }

  public async getSubscriptionCanceledDate({ orgId }: { orgId: string }): Promise<number> {
    const key = `${RedisConstants.SUBSCRIPTION_CANCELED_DATE}${orgId}`;
    const data = await this.getRedisValueWithKey(key);
    return Number(data);
  }

  public async getUserLastAccessedTeams(userId: string, orgId: string): Promise<string[]> {
    const key = `${RedisConstants.USER_LAST_ACCESSED_TEAM}${orgId}:${userId}`;
    const result = await this.redisClient.zRange(key, 0, -1, { REV: true });
    if (result.length > CommonConstants.MAX_NUMBER_OF_LAST_ACCESSED_TEAM) {
      await this.redisClient.zRemRangeByRank(key, 0, -1 - CommonConstants.MAX_NUMBER_OF_LAST_ACCESSED_TEAM);
    }
    return result.slice(0, CommonConstants.MAX_NUMBER_OF_LAST_ACCESSED_TEAM);
  }

  public async setUserLastAccessedTeam(userId: string, orgId: string, teamId: string) {
    const key = `${RedisConstants.USER_LAST_ACCESSED_TEAM}${orgId}:${userId}`;
    const timestamp = new Date().getTime();
    await this.redisClient.zAdd(key, { value: teamId, score: timestamp });
    this.setExpireKey(key, CommonConstants.USER_LAST_ACCESSED_TEAM_EXPIRE_IN);
  }

  public async trackFeatureUsage({ key, expireTime }: { key: string; expireTime: number }): Promise<number> {
    const usage = await this.redisClient.incr(key);
    if (usage === 1) {
      this.redisClient.expire(key, expireTime);
    }
    return usage;
  }

  public async getFeatureUsage(key: string): Promise<number> {
    const value = await this.getRedisValueWithKey(key);
    return Number(value || 0);
  }

  public async getFeatureBlockTime(key: string): Promise<number> {
    const blockTime = await this.getKeyTTL(key);
    return blockTime < 0 ? null : blockTime;
  }

  public setIntercomSessionKey(key: string, params: Record<string, string>, expireTime: number) {
    Object.entries(params).forEach(([field, value]) => {
      this.setHsetData(key, field, value);
    });

    this.setExpireKey(key, expireTime);
  }

  private getSignInSlackOAuthKey(userId: string): string {
    return `${RedisConstants.SIGN_IN_SLACK_OAUTH}:${userId}`;
  }

  public setSignInSlackOAuthToken(userId: string, signInToken: string): void {
    const key = this.getSignInSlackOAuthKey(userId);
    const expireTime = CommonConstants.SIGN_IN_SLACK_OAUTH_EXPIRE_IN;
    this.setRedisDataWithExpireTime({ key, value: signInToken, expireTime });
  }

  public async getSignInSlackOAuthToken(userId: string): Promise<string> {
    const key = this.getSignInSlackOAuthKey(userId);
    return this.getRedisValueWithKey(key);
  }

  public async removeSignInSlackOAuthToken(userId: string): Promise<boolean> {
    const key = this.getSignInSlackOAuthKey(userId);
    return this.deleteRedisByKey(key);
  }

  private getDocumentSharingQueueKey(userId: string, sharingExecutionId: string): string {
    return `${RedisConstants.DOCUMENT_SHARING_QUEUE}:${userId}:${sharingExecutionId}`;
  }

  public async setExpectedDocumentSharing(userId: string, sharingExecutionId: string, expected: number): Promise<void> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    await Promise.all([
      this.setRedisData(`${key}:expected`, String(expected)),
      this.setRedisData(`${key}:processed`, '0'),
    ]);
  }

  public async increaseProcessedDocumentSharingQueue(userId: string, sharingExecutionId: string): Promise<number> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    return this.increase(`${key}:processed`);
  }

  public async getDocumentSharingQueue(userId: string, sharingExecutionId: string): Promise<{ expected: number, processed: number }> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    const expected = await this.getRedisValueWithKey(`${key}:expected`);
    const processed = await this.getRedisValueWithKey(`${key}:processed`);
    return { expected: Number(expected), processed: Number(processed) };
  }

  public async setFailedDocumentSharing(userId: string, sharingExecutionId: string, failedEmails: string[]): Promise<void> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    await this.redisClient.rPush(`${key}:failed-emails`, failedEmails);
  }

  public async getFailedDocumentSharing(userId: string, sharingExecutionId: string): Promise<string[]> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    return this.redisClient.lRange(`${key}:failed-emails`, 0, -1);
  }

  public async removeDocumentSharingQueueKeys(userId: string, sharingExecutionId: string): Promise<void> {
    const key = this.getDocumentSharingQueueKey(userId, sharingExecutionId);
    await Promise.all([
      this.deleteRedisByKey(`${key}:expected`),
      this.deleteRedisByKey(`${key}:processed`),
      this.deleteRedisByKey(`${key}:failed-emails`),
    ]);
  }

  public setCreatePdfFromStaticToolUpload(remoteId: string, userId: string): void {
    const key = `${RedisConstants.CREATE_PDF_FROM_STATIC_TOOL_UPLOAD}${remoteId}:${userId}`;
    this.setRedisDataWithExpireTime({ key, value: 'true', expireTime: CommonConstants.CREATE_PDF_FROM_STATIC_TOOL_UPLOAD_EXPIRE_IN });
  }

  public async getCreatePdfFromStaticToolUpload(remoteId: string, userId: string): Promise<string> {
    const key = `${RedisConstants.CREATE_PDF_FROM_STATIC_TOOL_UPLOAD}${remoteId}:${userId}`;
    return this.getRedisValueWithKey(key);
  }

  public setThirdPartyAccessTokenForIndexing(userId: string, accessToken: string): void {
    const key = `${RedisConstants.THIRD_PARTY_ACCESS_TOKEN_FOR_INDEXING}${userId}`;
    this.setRedisDataWithExpireTime({ key, value: accessToken, expireTime: CommonConstants.THIRD_PARTY_ACCESS_TOKEN_FOR_INDEXING_EXPIRE_IN });
  }

  public async getThirdPartyAccessTokenForIndexing(userId: string): Promise<string> {
    const key = `${RedisConstants.THIRD_PARTY_ACCESS_TOKEN_FOR_INDEXING}${userId}`;
    return this.getRedisValueWithKey(key);
  }

  // Web Chatbot
  public getChatbotDailyRequestsLimitKey(userId: string): string {
    return `${RedisConstants.CHATBOT_DAILY_REQUESTS_LIMIT}${userId}`;
  }

  public getDailyRequestsLimit(userId: string): Promise<number> {
    const key = this.getChatbotDailyRequestsLimitKey(userId);
    return this.getFeatureUsage(key);
  }

  public async increaseDailyRequestsLimit(userId: string): Promise<void> {
    const key = this.getChatbotDailyRequestsLimitKey(userId);
    await this.trackFeatureUsage({
      key,
      expireTime: CommonConstants.CHATBOT_DAILY_REQUESTS_LIMIT_EXPIRE_IN,
    });
  }

  public async getDailyRequestsLimitBlockTime(userId: string): Promise<number> {
    const key = this.getChatbotDailyRequestsLimitKey(userId);
    return this.getFeatureBlockTime(key);
  }

  public getFormFieldDetectionUsageKey(userId: string): string {
    return `${RedisConstants.FORM_FIELD_DETECTION_USAGE_PER_DAY}${userId}`;
  }

  public getAutoDetectionUsageKey(userId: string): string {
    return `${RedisConstants.AUTO_DETECTION_USAGE_PER_DAY}${userId}`;
  }

  async getDetectionUsage(key: string): Promise<{ usage: number; blockTime: number }> {
    const [usage, blockTime] = await Promise.all([
      this.getFeatureUsage(key),
      this.getFeatureBlockTime(key),
    ]);
    return {
      usage,
      blockTime,
    };
  }

  async getFormFieldDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number, isExceeded: boolean }> {
    const key = this.getFormFieldDetectionUsageKey(userId);
    const { usage, blockTime } = await this.getDetectionUsage(key);
    return { usage, blockTime, isExceeded: usage >= FORM_FIELD_DETECTION_DAILY_QUOTA };
  }

  async getAutoDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number; isExceeded: boolean }> {
    const key = this.getAutoDetectionUsageKey(userId);
    const { usage, blockTime } = await this.getDetectionUsage(key);
    return { usage, blockTime, isExceeded: usage >= AUTO_DETECTION_DAILY_QUOTA };
  }

  // CNC avatar suggestion
  public getAvatarSuggestionKey(emailDomain: string): string {
    return `${RedisConstants.AVATAR_SUGGESTION}${emailDomain}`;
  }

  public setAvatarSuggestionFromExternalUrl(emailDomain: string, keyFile: string): void {
    const key = this.getAvatarSuggestionKey(emailDomain);
    this.setRedisDataWithExpireTime({ key, value: keyFile, expireTime: CommonConstants.AVATAR_SUGGESTION_EXPIRE_IN });
  }

  public async getAvatarSuggestionFromExternalUrl(emailDomain: string): Promise<string> {
    const key = this.getAvatarSuggestionKey(emailDomain);
    return this.getRedisValueWithKey(key);
  }

  private getTimeSensitiveCouponKey(orgId: string): string {
    return `${RedisConstants.TIME_SENSITIVE_COUPON_PREFIX}${orgId}`;
  }

  public async setTimeSensitiveCoupon({
    orgId,
    promotionCode,
    promotionCodeId,
    createdAt,
  }: {
    orgId: string;
    promotionCode: string;
    promotionCodeId: string;
    createdAt: number;
  }): Promise<void> {
    const key = this.getTimeSensitiveCouponKey(orgId);
    await this.redisClient.set(key, JSON.stringify({ promotionCode, promotionCodeId, createdAt }));

    const expireTime = Number(this.environmentService.getByKey(EnvConstants.TIME_SENSITIVE_COUPON_EXPIRE_TIME));
    const expireTimeUnit = this.environmentService.getByKey(EnvConstants.TIME_SENSITIVE_COUPON_EXPIRE_TIME_UNIT);
    const expireIn = moment.duration(expireTime, expireTimeUnit as moment.unitOfTime.Base).asSeconds();

    this.setExpireKey(key, expireIn);
  }

  public async getTimeSensitiveCoupon(orgId: string): Promise<{ promotionCode: string; promotionCodeId: string; createdAt: number } | null> {
    const key = this.getTimeSensitiveCouponKey(orgId);
    const data = await this.redisClient.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  public async deleteTimeSensitiveCoupon(orgId: string): Promise<void> {
    const key = this.getTimeSensitiveCouponKey(orgId);
    await this.redisClient.del(key);
  }
}
