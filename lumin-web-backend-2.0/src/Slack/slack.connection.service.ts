import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';
import {
  Model, QueryOptions, Types,
} from 'mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';

import {
  ISlackConnection,
  ISlackConnectionModel,
  SlackConnection,
  SlackConnectionCredential,
} from './interfaces/slack.interface';

@Injectable()
export class SlackConnectionService {
  private readonly algorithm = 'aes-256-ctr';

  private encryptionKeyValue: Buffer | null = null;

  constructor(
    @InjectModel('SlackConnection')
    private readonly slackConnectionModel: Model<ISlackConnectionModel>,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {}

  private get encryptionKey(): Buffer {
    if (!this.encryptionKeyValue) {
      const secret = this.environmentService.getByKey(EnvConstants.SLACK_CREDENTIAL_SECRET);
      const salt = this.environmentService.getByKey(EnvConstants.SLACK_CREDENTIAL_SALT);

      if (!secret || !salt) {
        throw new Error('Missing Slack credential encryption configuration');
      }

      this.encryptionKeyValue = scryptSync(secret, salt, 32);
    }
    return this.encryptionKeyValue;
  }

  async addSlackConnection(connection: SlackConnection, options: QueryOptions = {}): Promise<void> {
    const {
      userId,
      slackTeamId,
      slackUserId,
      credential,
    } = connection;
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, CommonConstants.CRYPTO_IV);
    const encryptedCredential = Buffer.concat([cipher.update(credential), cipher.final()]).toString('hex');

    await this.slackConnectionModel
      .updateOne(
        { userId: new Types.ObjectId(userId), slackTeamId, slackUserId },
        {
          $set: {
            credential: encryptedCredential,
            updatedAt: new Date(),
          },
        },
        { upsert: true, ...options },
      );
  }

  async getCredential(userId: string, slackTeamId: string): Promise<SlackConnectionCredential> {
    const slackConnection = await this.slackConnectionModel.findOne({ userId: new Types.ObjectId(userId), slackTeamId });
    if (!slackConnection) {
      throw new Error('Slack connection not found');
    }
    // decrypt the credential
    const decipher = createDecipheriv(this.algorithm, this.encryptionKey, CommonConstants.CRYPTO_IV);
    const credential = Buffer.from(slackConnection.credential, 'hex');
    const decryptedCredential = Buffer.concat([decipher.update(credential), decipher.final()]).toString();
    return JSON.parse(decryptedCredential) as SlackConnectionCredential;
  }

  async getSlackConnections(userId: string): Promise<ISlackConnection[]> {
    const connections = await this.slackConnectionModel.find({ userId: new Types.ObjectId(userId) });
    return connections.map((connection) => ({ ...connection.toObject(), _id: connection._id.toHexString() }));
  }

  async removeSlackConnection(userId: string, slackTeamId: string): Promise<void> {
    await this.slackConnectionModel.deleteOne({ userId: new Types.ObjectId(userId), slackTeamId });
  }

  async hasSlackTeamConnection(slackTeamId: string): Promise<boolean> {
    const connectionExists = await this.slackConnectionModel.exists({ slackTeamId });
    return !!connectionExists;
  }

  async hasSlackUserConnection(slackTeamId: string, slackUserId: string): Promise<boolean> {
    const connectionExists = await this.slackConnectionModel.exists({ slackTeamId, slackUserId });
    return !!connectionExists;
  }
}
