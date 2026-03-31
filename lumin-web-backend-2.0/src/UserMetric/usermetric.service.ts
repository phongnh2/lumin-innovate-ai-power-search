import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaymentPlanEnums } from 'Payment/payment.enum';
import { IUserMetricModel } from 'UserMetric/interfaces/usermetric.interface';

@Injectable()
export class UserMetricService {
  constructor(
    @InjectModel('UserMetric') private readonly userMetricModel: Model<IUserMetricModel>,
  ) { }

  public async createUserMetric({ userId, email, payment }) {
    const newUser = {
      userId,
      email,
      initPlan: payment.type || PaymentPlanEnums.FREE,
      shareCount: 0,
      annotateCount: 0,
    };
    await this.userMetricModel.create(newUser as any);
  }

  public async updateShareCount({ userId }, value = 1) {
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      user.shareCount += value;
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }

  public async updateAnnotateCount({ userId }, value = 1) {
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      user.annotateCount += value;
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }

  public async updateUpgradePlan({ userId, payment }) {
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      user.plan = { type: payment.type, period: payment.period };
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }

  public async updateOpenDocumentPersonal({ userId }) {
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      user.openDocument.ownedCount += 1;
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }

  public async updateOpenDocumentShared({ userId }, owner) {
    if (!owner) return;
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      if (owner.payment.type === PaymentPlanEnums.FREE) {
        user.openDocument.freeCount += 1;
      } else {
        user.openDocument.premiumCount += 1;
      }
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }

  public async updateOpenDocumentTeam({ userId }) {
    const user = await this.userMetricModel.findOne({ userId });
    if (user) {
      user.openDocument.teamCount += 1;
      await this.userMetricModel.updateOne({ userId }, user);
    }
  }
}
