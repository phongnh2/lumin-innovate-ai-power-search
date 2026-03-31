/* eslint-disable no-continue */
/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { FilterQuery } from 'mongoose';
import Stripe from 'stripe';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { CreateOrganizationSubscriptionPlans, DocStackPlan, DomainVisibilitySetting } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { UserService } from 'User/user.service';

import {
  PaymentCurrencyEnums, PaymentPeriodEnums, PaymentPlanEnums, PaymentStatusEnums,
} from './payment.enum';
import { PaymentService } from './payment.service';

interface NewCustomerMetadata {
  totalMembers: number;
  isBusinessDomain: number;
}

@Injectable()
export class PaymentScriptService {
  private stripeAccountIds: string[];

  private newBusinessPriceIds: string[];

  constructor(
    private readonly paymentService: PaymentService,
    private readonly environmentService: EnvironmentService,
    private readonly organizationService: OrganizationService,
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {
    this.stripeAccountIds = [
      this.environmentService.getByKey(EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT),
      this.environmentService.getByKey(EnvConstants.STRIPE_US_CONNECTED_ACCOUNT),
    ];
    this.newBusinessPriceIds = this.getAllBusinessPriceIds();
  }

  private getAllBusinessPriceIds() {
    return [
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_MONTHLY_USD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_MONTHLY_NZD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_MONTHLY_CAD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_MONTHLY_EUR'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_ANNUAL_USD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_ANNUAL_NZD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_ANNUAL_CAD'),
      this.environmentService.getByKey('STRIPE_ORG_BUSINESS_ANNUAL_EUR'),
      this.environmentService.getByKey('STRIPE_US_ACCOUNT_ORG_BUSINESS_MONTHLY_USD'),
      this.environmentService.getByKey('STRIPE_US_ACCOUNT_ORG_BUSINESS_ANNUAL_USD'),
    ];
  }

  async retrieveAllCustomers(
    handleCustomers: (customers: Stripe.Customer[], stripeAccountId: string, chunkSize: number) => Promise<void>,
    limit: number,
    chunkSize: number,
    stripeAccountId: string,
  ): Promise<void> {
    let hasMore = true;
    let startingAfter: string | undefined;
    let totalCustomers = 0;

    while (hasMore && (!limit || totalCustomers < limit)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const customers = await this.paymentService.listAllCustomers({
          limit: 50,
          starting_after: startingAfter,
        }, {
          stripeAccount: stripeAccountId,
        });

        if (customers.data.length > 0) {
          // Handle the retrieved customers with the provided callback
          await handleCustomers(customers.data, stripeAccountId, chunkSize);

          // Update startingAfter to the ID of the last customer in the current page
          startingAfter = customers.data[customers.data.length - 1].id;
        }
        const lastCustomer = customers.data[customers.data.length - 1];
        totalCustomers += customers.data.length;
        this.loggerService.info({
          context: 'PaymentScriptService-retrieveAllCustomers',
          message: `Retrieved ${totalCustomers} customers`,
        });

        // if last customer is created less than or equal 2024-06-01, assign hasMore = false
        if (lastCustomer.created < 1717200000) {
          hasMore = false;
        } else {
          hasMore = customers.has_more;
        }
      } catch (error) {
        this.loggerService.error({
          context: 'PaymentScriptService-retrieveAllCustomers',
          message: 'Error retrieving customers:',
          error,
        });
        hasMore = false;
      }
    }
  }

  async getCustomerMetadata(customerId: string): Promise<NewCustomerMetadata> {
    try {
      const organization = await this.organizationService.findOrgByCustomerId(customerId);
      if (!organization) {
        this.loggerService.info({
          context: 'PaymentScriptService-getCustomerMetadata',
          message: `No organization found for customer: ${customerId}`,
        });
        return null;
      }

      const totalMembers = await this.organizationService.countTotalActiveOrgMember({ orgId: organization._id });
      return {
        totalMembers,
        isBusinessDomain: Number(Utils.isBusinessDomain(organization.billingEmail)),
      };
    } catch (error) {
      this.loggerService.error({
        context: 'PaymentScriptService-getCustomerMetadata',
        message: 'Error getting customer metadata:',
        error,
        extraInfo: {
          customerId,
        },
      });
      return null;
    }
  }

  updateCustomerMetadataCallback = async (customers: Stripe.Customer[], stripeAccountId: string, chunkSize: number) => {
    for (let i = 0; i < customers.length; i += chunkSize) {
      const customerChunk = customers.slice(i, i + chunkSize);
      // eslint-disable-next-line no-await-in-loop
      await this.updateCustomerByChunkPromises(customerChunk, stripeAccountId);
    }
  };

  updateCustomerByChunkPromises = async (customers: Stripe.Customer[], stripeAccountId: string) => {
    const promises = customers.map(async (customer) => {
      this.loggerService.info({
        message: `---------------${customer.id}------------------`,
        context: 'PaymentScriptService-updateCustomerMetadataCallback',
      });
      if (customer.metadata.totalMembers) {
        this.loggerService.info({
          message: `Skip updated metadata for customer: ${customer.id}`,
          context: 'PaymentScriptService-updateCustomerMetadataCallback',
        });
      } else {
        const metadata = await this.getCustomerMetadata(customer.id);
        this.loggerService.info({
          context: 'PaymentScriptService-updateCustomerMetadataCallback',
          message: `metadata: ${JSON.stringify(metadata)}`,
        });
        if (!metadata) {
          this.loggerService.info({
            message: `No metadata found for customer: ${customer.id}`,
            context: 'PaymentScriptService-updateCustomerMetadataCallback',
          });
        } else {
          try {
            await this.paymentService.updateStripeCustomer(customer.id, {
              metadata: {
                ...customer.metadata,
                ...metadata,
              },
            }, {
              stripeAccount: stripeAccountId,
            }).then(() => {
              this.loggerService.info({
                context: 'PaymentScriptService-updateCustomerMetadataCallback',
                message: `Updated metadata successful for customer: ${customer.id}`,
              });
            });
          } catch (error) {
            this.loggerService.error({
              context: 'PaymentScriptService-updateCustomerMetadataCallback',
              message: 'Error updating metadata for customer:',
              error,
              extraInfo: {
                customerId: customer.id,
              },
            });
          }
        }
      }
    });
    return Promise.all(promises);
  };

  async updateAllCustomersMetadata(limit: number, chunkSize: number): Promise<void> {
    // eslint-disable-next-line no-restricted-syntax
    for (const stripeAccountId of this.stripeAccountIds) {
      await this.retrieveAllCustomers(this.updateCustomerMetadataCallback, limit, chunkSize, stripeAccountId);
    }
    this.loggerService.info({
      context: 'PaymentScriptService-updateAllCustomersMetadata',
      message: 'Finished updating all customers metadata',
    });
  }

  async migrateOrgBusinessToNewPrice(): Promise<void> {
    const businessOrgs = await this.getBusinessOrganizations();

    const excludeDomains = this.environmentService.getByKey(EnvConstants.EXCLUDE_DOMAIN_MIGRATE_TO_NEW_BUSINESS_PRICE);
    const excludeDomainList = excludeDomains.split(',');
    // eslint-disable-next-line no-restricted-syntax
    for (const org of businessOrgs) {
      if (excludeDomainList.includes(org.domain)) {
        this.loggerService.info({
          context: this.migrateOrgBusinessToNewPrice.name,
          message: 'Skip migrating org',
          extraInfo: {
            orgId: org._id,
            domain: org.domain,
          },
        });
      } else {
        await this.migrateSingleOrganization(org);
      }
    }
  }

  private async getBusinessOrganizations() {
    return this.organizationService.findOrganization({
      'payment.type': PaymentPlanEnums.ORG_BUSINESS,
      'payment.planRemoteId': { $nin: this.newBusinessPriceIds },
    }, {
      _id: 1,
      payment: 1,
      name: 1,
      domain: 1,
    });
  }

  private async migrateSingleOrganization(org: { _id: string; name: string, payment: any }): Promise<void> {
    const { _id, name, payment } = org;
    this.loggerService.info({
      context: this.migrateSingleOrganization.name,
      message: 'Start migrating org',
      extraInfo: {
        payment,
        orgId: _id,
        name,
      },
    });
    const {
      currency, period, subscriptionRemoteId, stripeAccountId,
    } = payment;

    const newPriceId = this.paymentService.getStripePlanRemoteId({
      plan: PaymentPlanEnums.ORG_BUSINESS,
      period: period as PaymentPeriodEnums,
      currency: currency as PaymentCurrencyEnums,
      stripeAccountId,
    });

    const stripeSubscription = await this.getStripeSubscription(
      subscriptionRemoteId as string,
      stripeAccountId as string,
      _id,
    );
    if (!stripeSubscription) {
      return;
    }

    const mainItem = this.paymentService.getMainSubscriptionItem(
      stripeSubscription as Stripe.Subscription,
      payment.planRemoteId as string,
    );
    if (!mainItem) {
      this.loggerService.info({
        context: this.migrateOrgBusinessToNewPrice.name,
        message: 'No main item found for org',
        extraInfo: {
          orgId: _id,
          subscriptionRemoteId,
        },
      });
      return;
    }

    const { id: subscriptionItemId } = mainItem;
    const updatedSubscriptionItem = await this.updateSubscriptionItem(
      String(subscriptionItemId),
      newPriceId,
      stripeAccountId as string,
      _id,
      subscriptionRemoteId as string,
    );
    if (!updatedSubscriptionItem) {
      return;
    }

    await this.updateOrganizationAndLog(_id, newPriceId, subscriptionRemoteId as string);
  }

  private async getStripeSubscription(
    subscriptionRemoteId: string,
    stripeAccountId: string,
    orgId: string,
  ) {
    return this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: subscriptionRemoteId,
      options: {
        stripeAccount: stripeAccountId,
      },
    }).catch((error) => {
      this.loggerService.error({
        context: this.migrateOrgBusinessToNewPrice.name,
        message: 'Error getting stripe subscription info',
        error,
        extraInfo: {
          orgId,
          subscriptionRemoteId,
        },
      });
      return null;
    });
  }

  private async updateSubscriptionItem(
    subscriptionItemId: string,
    planRemoteId: string,
    stripeAccountId: string,
    orgId: string,
    subscriptionRemoteId: string,
  ) {
    const updatedSubscriptionItem = await this.paymentService.updateSubscriptionItem(
      subscriptionItemId,
      {
        proration_behavior: 'none',
        price: planRemoteId,
      },
      {
        stripeAccount: stripeAccountId,
      },
    ).catch((error) => {
      this.loggerService.error({
        context: this.migrateOrgBusinessToNewPrice.name,
        message: 'Error updating subscription item',
        error,
        extraInfo: {
          orgId,
          subscriptionRemoteId,
          subscriptionItemId,
        },
      });
    });

    if (!updatedSubscriptionItem) {
      this.loggerService.info({
        context: this.migrateOrgBusinessToNewPrice.name,
        message: 'No updated subscription item',
        extraInfo: {
          orgId,
          subscriptionRemoteId,
        },
      });
      return null;
    }

    this.loggerService.info({
      context: this.migrateOrgBusinessToNewPrice.name,
      message: 'Updated subscription item',
      extraInfo: {
        orgId,
        subscriptionRemoteId,
        subscriptionItemId,
      },
    });

    return updatedSubscriptionItem;
  }

  private async updateOrganizationAndLog(
    orgId: string,
    newPriceId: string,
    subscriptionRemoteId: string,
  ): Promise<void> {
    const updatedOrg = await this.organizationService.updateOrganizationById(orgId, {
      'payment.planRemoteId': newPriceId,
    });

    this.loggerService.info({
      context: this.migrateOrgBusinessToNewPrice.name,
      message: 'Updated org',
      extraInfo: {
        orgId,
        subscriptionRemoteId,
      },
    });

    this.loggerService.info({
      context: this.migrateOrgBusinessToNewPrice.name,
      message: 'Finished migrating org',
      extraInfo: {
        orgId: updatedOrg._id,
        subscriptionRemoteId,
      },
    });
  }

  async createSingleOldBusinessPlan(params: { email: string, priceId: string, isTrial: boolean }): Promise<void> {
    const freeTrialTime = Number(this.environmentService.getByKey(EnvConstants.FREE_TRIAL_TIME));
    const freeTrialTimeUnit = this.environmentService.getByKey(EnvConstants.FREE_TRIAL_TIME_UNIT);
    const freeTrialEndTime = moment()
      .add(
        freeTrialTime,
        freeTrialTimeUnit as moment.unitOfTime.Base,
      )
      .unix();
    const { email, priceId, isTrial } = params;
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      this.loggerService.info({
        context: this.createSingleOldBusinessPlan.name,
        message: 'User not found',
        extraInfo: {
          email,
        },
      });
      return;
    }
    const createdCardToken = await this.paymentService.createCardToken(
      {
        card: {
          number: '4242424242424242',
          exp_month: '12',
          exp_year: '2025',
          cvc: '123',
        },
      },
      { stripeAccount: this.stripeAccountIds[0] },
    );
    const source = await this.paymentService.createSource({
      type: 'card',
      token: createdCardToken.id,
    }, { stripeAccount: this.stripeAccountIds[0] });

    const createdCustomer = await this.paymentService.createStripeCustomer({
      email,
      name: user.name,
      metadata: {
        lumin_user_id: user._id,
      },
      // attach payment method
      source: source.id,
    }, {
      stripeAccount: this.stripeAccountIds[0],
    });
    const subscription = await this.paymentService.createStripeSubscription({
      customer: createdCustomer.id,
      trial_end: isTrial ? freeTrialEndTime : 'now',
      items: [{
        price: priceId,
        quantity: 1,
      }],
    }, {
      stripeAccount: this.stripeAccountIds[0],
    });

    const period = subscription.items.data[0].price.recurring.interval === 'year' ? PaymentPeriodEnums.ANNUAL : PaymentPeriodEnums.MONTHLY;
    const currency = subscription.items.data[0].price.currency.toUpperCase() as PaymentCurrencyEnums;

    const organization = await this.organizationService.handleCreateCustomOrganization({
      creator: user,
      orgName: `Business test ${isTrial ? 'trial' : ''} ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      organizationAvatar: {
        fileBuffer: Buffer.from(''),
        mimetype: 'image/png',
      },
      isMigratedFromTeam: false,
      settings: {
        domainVisibility: DomainVisibilitySetting.VISIBLE_NEED_APPROVE,
      },
    });
    const updatedOrg = await this.organizationService.updateOrganizationById(organization._id, {
      payment: {
        customerRemoteId: createdCustomer.id,
        type: PaymentPlanEnums.ORG_BUSINESS,
        planRemoteId: priceId,
        subscriptionRemoteId: subscription.id,
        stripeAccountId: this.stripeAccountIds[0],
        quantity: 1,
        currency,
        period,
        status: PaymentStatusEnums.ACTIVE,
        trialInfo: {
          highestTrial: CreateOrganizationSubscriptionPlans.ORG_BUSINESS,
          endTrial: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
        },
      },
    });
    this.loggerService.info({
      context: this.createSingleOldBusinessPlan.name,
      message: 'Updated org',
      extraInfo: {
        orgId: updatedOrg._id,
        email,
        updatedOrg,
      },
    });
  }

  async createListOldBusinessPlan(params: { email: string, priceId: string, isTrial: boolean }): Promise<void> {
    const { email, priceId, isTrial } = params;
    for (let i = 0; i < 20; i++) {
      await this.createSingleOldBusinessPlan({
        email,
        priceId,
        isTrial,
      });
    }
  }

  async migrateLegacyBusinessToNewBusiness(orgIds?: string[]): Promise<void> {
    this.loggerService.info({
      context: this.migrateLegacyBusinessToNewBusiness.name,
      message: 'Starting legacy business migration',
    });

    const excludeOrgIds = this.environmentService.getByKey(EnvConstants.EXCLUDE_ORG_IDS_MIGRATE_TO_NEW_BUSINESS);
    const excludeOrgIdList = excludeOrgIds.split(',');
    const migrationCouponCode = this.environmentService.getByKey(EnvConstants.COUPON_CODE_MIGRATE_TO_NEW_BUSINESS);

    this.loggerService.info({
      context: this.migrateLegacyBusinessToNewBusiness.name,
      message: 'Migration configuration loaded',
      extraInfo: {
        enterpriseOrgIdsCount: excludeOrgIdList.length,
        couponCode: migrationCouponCode,
      },
    });

    const orgFilter: FilterQuery<IOrganization> = { 'payment.type': { $in: [PaymentPlanEnums.BUSINESS] } } as any;
    if (orgIds && orgIds.length > 0) {
      orgFilter._id = { $in: orgIds };
    }

    const legacyOrganizations: IOrganization[] = await this.organizationService.findOrganization(orgFilter);

    this.loggerService.info({
      context: this.migrateLegacyBusinessToNewBusiness.name,
      message: 'Found legacy organizations',
      extraInfo: {
        totalFound: legacyOrganizations.length,
      },
    });

    for (let i = 0; i < legacyOrganizations.length; i++) {
      const org: IOrganization = legacyOrganizations[i];
      try {
        if (excludeOrgIdList.includes(org._id)) {
          this.loggerService.info({
            context: this.migrateLegacyBusinessToNewBusiness.name,
            message: 'Skipping enterprise upgrade organization',
            extraInfo: {
              orgId: org._id,
              orgName: org.name,
              progress: `${i + 1}/${legacyOrganizations.length}`,
            },
          });
          continue;
        }

        const { payment } = org;
        const paymentStatus = payment.status as PaymentStatusEnums;
        const { subscriptionRemoteId, stripeAccountId } = payment;

        this.loggerService.info({
          context: this.migrateLegacyBusinessToNewBusiness.name,
          message: 'Processing organization',
          extraInfo: {
            orgId: org._id,
            orgName: org.name,
            currentPlan: payment.type,
            currentStatus: paymentStatus,
            progress: `${i + 1}/${legacyOrganizations.length}`,
          },
        });

        if (!subscriptionRemoteId) {
          await this.downgradeLegacyOrgToFree(org);
          continue;
        }

        const currentSubscription: Stripe.Subscription = await this.paymentService.getStripeSubscriptionInfo({
          subscriptionId: subscriptionRemoteId,
          options: { stripeAccount: stripeAccountId },
        }).catch((error) => {
          if (error.raw?.code === 'resource_missing') {
            return null;
          }
          throw error;
        });

        if (!currentSubscription || currentSubscription.status === 'canceled') {
          await this.downgradeLegacyOrgToFree(org);
        } else {
          await this.migrateLegacyOrgToNewBusiness(org, currentSubscription, migrationCouponCode);
        }
      } catch (error) {
        this.loggerService.error({
          context: this.migrateLegacyBusinessToNewBusiness.name,
          message: 'Error processing organization',
          error,
          extraInfo: {
            orgId: org._id,
            orgName: org.name,
            progress: `${i + 1}/${legacyOrganizations.length}`,
          },
        });
      }
    }

    this.loggerService.info({
      context: this.migrateLegacyBusinessToNewBusiness.name,
      message: 'Migration completed',
    });
  }

  private async downgradeLegacyOrgToFree(org: IOrganization): Promise<void> {
    this.loggerService.info({
      context: this.downgradeLegacyOrgToFree.name,
      message: 'Downgrading inactive organization to free',
      extraInfo: { orgId: org._id, orgName: org.name },
    });

    const { payment } = org;

    await this.organizationService.updateOrganizationProperty(org._id, {
      payment: {
        ...this.paymentService.getFreePaymentPayload(payment),
        trialInfo: payment.trialInfo,
      },
    });

    this.loggerService.info({
      context: this.downgradeLegacyOrgToFree.name,
      message: 'Successfully downgraded organization to free',
      extraInfo: { orgId: org._id },
    });
  }

  private async migrateLegacyOrgToNewBusiness(org: IOrganization, subscription: Stripe.Subscription, couponCode: string): Promise<void> {
    this.loggerService.info({
      context: this.migrateLegacyOrgToNewBusiness.name,
      message: 'Migrating organization to new business plan',
      extraInfo: { orgId: org._id, orgName: org.name },
    });

    const { payment } = org;
    const {
      period, currency, stripeAccountId, subscriptionRemoteId, planRemoteId,
    } = payment;

    const newPlanRemoteId = this.paymentService.getStripePlanRemoteId({
      plan: PaymentPlanEnums.ORG_BUSINESS,
      period: period as PaymentPeriodEnums,
      currency: currency as PaymentCurrencyEnums,
      stripeAccountId,
    });

    this.loggerService.info({
      context: this.migrateLegacyOrgToNewBusiness.name,
      message: 'Plan remote ID retrieved',
      extraInfo: {
        orgId: org._id,
        oldPlanRemoteId: planRemoteId,
        newPlanRemoteId,
        period,
        currency,
      },
    });

    let subscriptionItemId: string;
    if (subscription.id === 'sub_1KJ407KS8TSoP9bDyM3rfatM') {
      subscriptionItemId = subscription.items.data[0].id;
      this.loggerService.info({
        context: this.migrateLegacyOrgToNewBusiness.name,
        message: 'Special case applied: using first subscription item id due to known wrong planRemoteId',
        extraInfo: {
          orgId: org._id,
          subscriptionId: subscription.id,
          chosenItemId: subscriptionItemId,
        },
      });
    } else {
      subscriptionItemId = await this.getSubscriptionItemId(subscription, planRemoteId);
    }

    const subscriptionUpdateParams: Stripe.SubscriptionUpdateParams = {
      proration_behavior: 'none',
      items: [{
        id: subscriptionItemId,
        price: newPlanRemoteId,
        quantity: 1,
      }],
    };

    const discountCoupon = subscription.discount?.coupon;
    const percentOff = discountCoupon?.percent_off;
    const appliesToProducts = (discountCoupon as any)?.applies_to?.products as string[] | undefined;
    const isProductRestricted = Array.isArray(appliesToProducts) && appliesToProducts.length > 0;
    const isHundredPercentOff = percentOff === 100;
    const shouldOmitCoupon = Boolean(discountCoupon && isHundredPercentOff && !isProductRestricted);

    this.loggerService.info({
      context: this.migrateLegacyOrgToNewBusiness.name,
      message: 'Coupon selection decision',
      extraInfo: {
        orgId: org._id,
        hasExistingDiscount: Boolean(subscription.discount),
        discountCouponId: discountCoupon?.id,
        percentOff,
        isProductRestricted,
        behavior: shouldOmitCoupon ? 'omit_coupon_param_use_existing_100_percent_discount' : 'apply_provided_coupon_code',
        couponCodeWhenApplied: shouldOmitCoupon ? undefined : couponCode,
      },
    });

    if (!shouldOmitCoupon && couponCode) {
      subscriptionUpdateParams.coupon = couponCode;
    }

    const updatedSubscription = await this.paymentService.updateStripeSubscription(
      subscriptionRemoteId,
      subscriptionUpdateParams,
      { stripeAccount: stripeAccountId },
    );

    this.loggerService.info({
      context: this.migrateLegacyOrgToNewBusiness.name,
      message: 'Stripe subscription updated',
      extraInfo: {
        orgId: org._id,
        subscriptionId: payment.subscriptionRemoteId,
        newStatus: updatedSubscription.status,
      },
    });

    await this.organizationService.updateOrganizationProperty(org._id, {
      payment: {
        ...payment,
        type: PaymentPlanEnums.ORG_BUSINESS,
        planRemoteId: newPlanRemoteId,
        quantity: 1,
        trialInfo: this.organizationService.getTrialInfoObject(
          PaymentPlanEnums.ORG_BUSINESS as unknown as DocStackPlan,
          payment.trialInfo,
        ),
      },
    });

    this.loggerService.info({
      context: this.migrateLegacyOrgToNewBusiness.name,
      message: 'Successfully migrated organization to new business plan',
      extraInfo: {
        orgId: org._id,
        oldPlan: payment.type,
        newPlan: PaymentPlanEnums.ORG_BUSINESS,
        quantity: 1,
      },
    });
  }

  private getSubscriptionItemId(subscription: Stripe.Subscription, planRemoteId: string): Promise<string> {
    const mainItem = this.paymentService.getMainSubscriptionItem(subscription, planRemoteId);
    if (!mainItem) {
      throw new Error(`Main subscription item not found for subscription ${subscription.id} with plan ${planRemoteId}`);
    }

    return mainItem.id;
  }
}
