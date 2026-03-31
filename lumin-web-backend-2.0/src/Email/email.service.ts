/* eslint-disable default-param-last */
/* eslint-disable global-require */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { get } from 'lodash';
import * as moment from 'moment';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EmailTagEnum } from 'Common/common.enum';
import { EmailType } from 'Common/common.interface';
import { CommonConstants } from 'Common/constants/CommonConstants';
import {
  SUBJECT, EMAIL_TYPE, MappingEmailSettingWithPath,
  CAMPAIGN_EMAIL,
} from 'Common/constants/EmailConstant';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ORG_URL_SEGEMENT, SALE_ORG_URL_SEGMENT, ORGANIZATION_TEXT } from 'Common/constants/OrganizationConstants';
import { PLAN_TEXT } from 'Common/constants/PaymentConstant';
import { TEAM_TEXT, TEAM_URL_SEGEMENT } from 'Common/constants/TeamConstant';
import { Utils } from 'Common/utils/Utils';

import { Callback } from 'Calback/callback.decorator';
import { CallbackService } from 'Calback/callback.service';
import { EmailLoaderService } from 'Email/email-loader.service';
import helpers from 'Email/mjml/helpers/Handlebars';
import { sanitizeDataForEmail } from 'Email/mjml/utils/sanitizer';
import { EnvironmentService } from 'Environment/environment.service';
import { EventScopes, NonDocumentEventNames } from 'Event/enums/event.enum';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { PaymentPeriod } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums, PaymentProductEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { User } from 'User/interfaces/user.interface';
import { UserOrigin } from 'User/user.enum';
import { UserService } from 'User/user.service';

const formData = require('form-data');
const MailgunJs = require('mailgun.js');

helpers.register();

const mailgunJs = new MailgunJs(formData);

interface EmailAttachment {
  filename: string;
  data: Buffer;
}

interface EmailData {
  from: string;
  to: string[];
  html: string;
  subject: string;
  'o:tracking': string;
  'o:tracking-clicks': string;
  'o:tracking-opens': string;
  'o:tag': EmailTagEnum;
  attachment?: EmailAttachment[];
}

@Injectable()
export class EmailService {
  private mailgun;

  private mailgunUrl = this.environmentService.getByKey(EnvConstants.MAILGUN_DOMAIN);

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly eventService: EventServiceFactory,
    private readonly emailLoaderService: EmailLoaderService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Callback(RedisConstants.REDIS_EXPIRED) private readonly callbackService: CallbackService,
  ) {
    this.mailgun = mailgunJs.client({
      username: 'api',
      key: this.environmentService.getByKey(EnvConstants.MAILGUN_API_KEY),
      public_key: this.environmentService.getByKey(EnvConstants.MAILGUN_API_PUBLIC_KEY),
    });
    this.setupRedisHook();
  }

  private canSendEmail(type: EmailType, user: User) {
    return type.category === 'commonEmail' || get(user.setting, MappingEmailSettingWithPath[type.category]);
  }

  private genEmailData(data: Record<string, unknown>): Record<string, unknown> {
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    const saleUrl = this.environmentService.getByKey(EnvConstants.SALE_DASHBOARD_URL);
    const staticUrl = this.environmentService.getByKey(EnvConstants.STATIC_URL);
    const luminSignUrl = this.environmentService.getByKey(EnvConstants.SIGN_URL);
    const assetUrl = CommonConstants.LUMIN_ASSETS_URL;
    const mobileUrl = this.environmentService.getByKey(EnvConstants.MOBILE_APP_URL as string);
    const orgWord = ORGANIZATION_TEXT;
    const teamWord = TEAM_TEXT;
    const orgUrlSegment = ORG_URL_SEGEMENT;
    const saleOrgUrlSegment = SALE_ORG_URL_SEGMENT;
    const teamUrlSegment = TEAM_URL_SEGEMENT;
    const emailData: Record<string, any> = {
      baseUrl,
      staticUrl,
      saleUrl,
      assetUrl,
      luminSignUrl,
      mobileUrl,
      orgWord,
      teamWord,
      orgUrlSegment,
      teamUrlSegment,
      saleOrgUrlSegment,
      ...data,
    };
    return emailData;
  }

  public async sendEmailHOF(
    type: EmailType,
    emails: string[],
    data: Record<string, any> = {},
    attachments?: EmailAttachment[],
  ): Promise<void> {
    const users = await Promise.all(emails.map((email) => this.userService.findUserByEmail(email)));
    const mailList = users
      .filter(((user) => user && (!user.setting || this.canSendEmail(type, user))))
      .map(({ email }) => email);
    if (mailList.length > 0) {
      this.sendEmail(type, mailList, data, undefined, attachments);
    }
  }

  public async sendEmail(
    type: EmailType,
    receiver: string[],
    rawData: Record<string, any> = {},
    userOrigin?: string,
    attachments?: EmailAttachment[],
  ): Promise<any> {
    const data = sanitizeDataForEmail(rawData);
    try {
      if (userOrigin && userOrigin === UserOrigin.BANANASIGN) {
        return null;
      }

      let emailAddress;
      switch (type.category) {
        case 'subscriptionEmail': {
          emailAddress = 'billing@luminpdf.com';
          break;
        }
        default: {
          emailAddress = 'noreply@luminpdf.com';
        }
      }

      let emailTag: EmailTagEnum;
      switch (type.description) {
        case EMAIL_TYPE.WELCOME_ORGANIZATION_NEW_PRICING.description: {
          emailTag = {
            [PLAN_TEXT[PaymentPlanEnums.ORG_STARTER]]: EmailTagEnum.PAYMENT_STARTER,
            [PLAN_TEXT[PaymentPlanEnums.ORG_PRO]]: EmailTagEnum.PAYMENT_PRO,
            [PLAN_TEXT[PaymentPlanEnums.ORG_BUSINESS]]: EmailTagEnum.PAYMENT_BUSINESS,
            [PLAN_TEXT[PaymentPlanEnums.BUSINESS]]: EmailTagEnum.PAYMENT_BUSINESS,
          }[data.plan];
          break;
        }
        case EMAIL_TYPE.RENEW_PLAN_SUCCESS_ORGANIZATION.description: {
          emailTag = {
            [PaymentPeriod.MONTHLY]: EmailTagEnum.PAYMENT_MONTHLY_SUBSCRIPTION_RENEWED,
            [PaymentPeriod.ANNUAL]: EmailTagEnum.PAYMENT_ANNUAL_SUBSCRIPTION_RENEWED,
          }[(data.period as string).toUpperCase()];
          break;
        }
        case EMAIL_TYPE.REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE.description: {
          emailTag = data.isOneDayRemaining ? EmailTagEnum.PAYMENT_SET_TO_CANCEL_IN_1_DAY : EmailTagEnum.PAYMENT_SET_TO_CANCEL_IN_3_DAYS;
          break;
        }
        default: {
          emailTag = type.tag;
        }
      }

      const sender = `Lumin PDF <${emailAddress}>`;
      const validatedEmails = receiver.filter((item) => Utils.validateEmail(item));
      // eslint-disable-next-line dot-notation
      const emailSubject = data['subject'] || SUBJECT[type.description];
      const compiler = await this.emailLoaderService.load(type.description);
      const combinedData = this.genEmailData(data);
      const html = compiler(combinedData);
      const emailData: EmailData = {
        from: sender,
        to: validatedEmails,
        html,
        subject: emailSubject,
        'o:tracking': 'yes',
        'o:tracking-clicks': 'yes',
        'o:tracking-opens': 'yes',
        'o:tag': emailTag,
      };

      if (attachments && attachments.length > 0) {
        // Temporarily disable invoice attachments
        // emailData.attachment = attachments;
      }

      validatedEmails.forEach((email) => {
        this.eventService.createEvent({
          eventName: NonDocumentEventNames.TRANSACTIONAL_EMAIL_SENT,
          eventScope: EventScopes.PERSONAL,
          target: { email },
          transactionalEmail: { subject: emailSubject },
        });
      });
      return await this.mailgun.messages.create(this.mailgunUrl, emailData);
    } catch (error) {
      this.loggerService.warn({
        context: 'sendMail',
        error,
      });
      return null;
    }
  }

  private setupRedisHook(): void {
    this.callbackService.registerCallbacks([{
      run: async ({ key }: { key: string }) => {
        // eslint-disable-next-line prefer-regex-literals
        const matchedRemindSubscriptionExpiredKey = key && RegExp(/remind-subscription-expired:*:*/).test(key);
        if (matchedRemindSubscriptionExpiredKey) {
          const [_, timeToSubscriptionExpired, orgId, timeSubscriptionWillExpired] = key.split(':');
          const organization = await this.organizationService.findOneOrganization({ _id: orgId });
          if (
            organization
            && (
              organization.payment?.status === PaymentStatusEnums.CANCELED
              || organization.payment?.subscriptionItems?.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED)
            )) {
            this.remindSubscriptionExpired(orgId, Number(timeToSubscriptionExpired), timeSubscriptionWillExpired);
          }
        }
      },
    }]);
  }

  private async remindSubscriptionExpired(orgId: string, timeToSubscriptionExpired: number, timeSubscriptionWillExpired: string): Promise<void> {
    const remindEmailKey = `Reminder-email-term-${orgId}`;
    const setKeySuccessfully = await this.redisService.setKeyIfNotExist(remindEmailKey, '1', '180000');
    if (!setKeySuccessfully) {
      return;
    }
    const organization = await this.organizationService.getOrgById(orgId);
    const receiverEmail = (await this.organizationService.getOrganizationMemberByRole(
      orgId,
      [OrganizationRoleEnums.ORGANIZATION_ADMIN, OrganizationRoleEnums.BILLING_MODERATOR],
    )).map((user) => user.email);
    const totalMembers = await this.organizationService.getTotalMemberInOrg(orgId);
    if (organization) {
      const { subscriptionItems } = organization.payment;
      const cancelSubItems = subscriptionItems?.filter((subItem) => subItem.paymentStatus === PaymentStatusEnums.CANCELED);
      const isOnlySignSub = cancelSubItems?.length === 1 && cancelSubItems[0].productName === PaymentProductEnums.SIGN;
      const payment = await this.paymentService.getNewPaymentObject(organization.payment);
      const canceledProducts = payment.subscriptionItems
        .filter((item) => (item.paymentStatus as PaymentStatusEnums) === PaymentStatusEnums.CANCELED)
        .map((item) => ({ productName: item.productName }));
      this.sendEmailHOF(EMAIL_TYPE.REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE, receiverEmail, {
        subject: SUBJECT[EMAIL_TYPE.REMIND_SUBSCRIPTION_ORGANIZATION_EXPIRE.description].replace('#{orgName}', organization.name),
        expireDate: moment.unix(Number(timeSubscriptionWillExpired)).format('MMM DD, YYYY'),
        totalMembers: isOnlySignSub ? organization.premiumSeats.length : totalMembers,
        organization,
        isOneDayRemaining: timeToSubscriptionExpired === 1,
        orgName: organization.name,
        orgId,
        subscriptionItems: payment.subscriptionItems,
        products: canceledProducts,
      });
    }
  }

  generateDeeplinkForEmail(mobilePath: string, path?: string): string {
    const baseUrl = this.environmentService.getByKey(EnvConstants.BASE_URL);
    const encodeUrl = encodeURIComponent(path ? `${baseUrl}${path}` : baseUrl);
    const campaign = CAMPAIGN_EMAIL?.[mobilePath];
    const campaignStr = campaign ? `&~campaign=${campaign}` : '';
    const mobileDomain = this.environmentService.getByKey(EnvConstants.MOBILE_APP_URL);
    return `${mobileDomain}${mobilePath}?$deeplink_path=${encodeUrl}&$desktop_url=${encodeUrl}${campaignStr}`;
  }
}
