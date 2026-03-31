import { IOrganization, IOrganizationProto } from 'Organization/interfaces/organization.interface';
import { OrganizationRoleEnums } from 'Organization/organization.enum';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import {
  PaymentPeriodEnums, PaymentPlanEnums, PaymentProductEnums, PaymentStatusEnums,
} from 'Payment/payment.enum';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';

export class OrganizationUtils {
  public static sortedByRoleAndPlan({
    currentOrg, nextOrg, enableSortByRole = true,
  }: {
    currentOrg: { organization: IOrganization, role?: OrganizationRoleEnums };
    nextOrg: { organization: IOrganization, role?: OrganizationRoleEnums };
    enableSortByRole?: boolean;
  }) {
    const paymentTypePriority = {
      [PaymentPlanEnums.ENTERPRISE]: 1,
      [PaymentPlanEnums.ORG_BUSINESS]: 2,
      [PaymentPlanEnums.ORG_PRO]: 3,
      [PaymentPlanEnums.ORG_STARTER]: 4,
      [PaymentPlanEnums.BUSINESS]: 5,
      [PaymentPlanEnums.FREE]: 6,
    };
    const paymentPeriodPriority = {
      [PaymentPeriodEnums.ANNUAL]: 1,
      [PaymentPeriodEnums.MONTHLY]: 2,
    };
    const rolePriority = {
      [OrganizationRoleEnums.ORGANIZATION_ADMIN]: 1,
      [OrganizationRoleEnums.BILLING_MODERATOR]: 2,
    };
    const statusPriority = {
      [PaymentStatusEnums.ACTIVE]: 1,
      [PaymentStatusEnums.TRIALING]: 2,
      [PaymentStatusEnums.CANCELED]: 3,
    };
    const paymentTypePriorityCurrentOrg = paymentTypePriority[currentOrg.organization.payment.type];
    const paymentTypePriorityNextOrg = paymentTypePriority[nextOrg.organization.payment.type];
    const periodPriorityCurrentOrg = paymentPeriodPriority[currentOrg.organization.payment.period] || 0;
    const periodPriorityNextOrg = paymentPeriodPriority[nextOrg.organization.payment.period] || 0;
    const planStatusPriorityCurrentOrg = statusPriority[currentOrg.organization.payment.status] || 0;
    const planStatusPriorityNextOrg = statusPriority[nextOrg.organization.payment.status] || 0;
    if (enableSortByRole) {
      const rolePriorityCurrentOrg = rolePriority[currentOrg.role] || 0;
      const rolePriorityNextOrg = rolePriority[nextOrg.role] || 0;
      if ((rolePriorityCurrentOrg - rolePriorityNextOrg) !== 0) {
        return rolePriorityCurrentOrg - rolePriorityNextOrg;
      }
    }
    if ((paymentTypePriorityCurrentOrg - paymentTypePriorityNextOrg) !== 0) {
      return paymentTypePriorityCurrentOrg - paymentTypePriorityNextOrg;
    }
    if ((periodPriorityCurrentOrg - periodPriorityNextOrg) !== 0) {
      return periodPriorityCurrentOrg - periodPriorityNextOrg;
    }
    return planStatusPriorityCurrentOrg - planStatusPriorityNextOrg;
  }

  public static convertToOrganizationProto(organization:
    IOrganization & {
      payment: PaymentSchemaInterface
      & { isSignProSeat?: boolean, isEnterprise?: boolean, hasSubscription?: boolean }
    })
    : IOrganizationProto {
    return {
      organization_id: organization._id,
      name: organization.name,
      created_at: organization.createdAt.getTime(),
      payment: {
        type: organization.payment.type,
        period: organization.payment.period,
        status: organization.payment.status,
        customer_remote_id: organization.payment.customerRemoteId,
        subscription_remote_id: organization.payment.subscriptionRemoteId,
        plan_remote_id: organization.payment.planRemoteId,
        quantity: organization.payment.quantity,
        currency: organization.payment.currency,
        is_sign_pro_seat: organization.payment.isSignProSeat,
        is_enterprise: organization.payment.isEnterprise,
        has_subscription: organization.payment.hasSubscription,
      },
      billing_email: organization.billingEmail,
      url: organization.url,
      domain: organization.domain,
      associate_domains: organization.associateDomains,
      avatar_remote_id: organization.avatarRemoteId,
      settings: {
        google_sign_in: organization.settings.googleSignIn,
        auto_approve: organization.settings.autoApprove,
        password_strength: organization.settings.passwordStrength,
        template_workspace: organization.settings.templateWorkspace,
        domain_visibility: organization.settings.domainVisibility,
        auto_upgrade: organization.settings.autoUpgrade,
        other: {
          guest_invite: organization.settings.other.guestInvite,
          hide_member: organization.settings.other.hideMember,
        },
      },
      deleted_at: organization.deletedAt ? organization.deletedAt.getTime() : undefined,
      premium_seats: organization.premiumSeats?.length,
    };
  }

  public static interceptPaymentByProduct(organization: IOrganization, product: string, userId?: string) {
    const { subscriptionItems = [], type } = organization.payment;
    const productSubscription = subscriptionItems.find((item) => item.productName === product);
    const pdfSubscription = subscriptionItems.find((item) => item.productName === PaymentProductEnums.PDF);
    const isEnterprise = Boolean(pdfSubscription?.paymentType === PaymentPlanEnums.ENTERPRISE) || type === PaymentPlanEnums.ENTERPRISE;
    let hasSubscription = false;
    const premiumProducts = PaymentUtilsService.getPremiumProducts(organization.payment);
    if (premiumProducts.length > 0) {
      hasSubscription = true;
    }
    if (!productSubscription) {
      return {
        ...organization.payment,
        isSignProSeat: false,
        isEnterprise,
        hasSubscription,
      };
    }
    let isSignProSeat = false;

    if (product === PaymentProductEnums.SIGN && userId) {
      isSignProSeat = Boolean(organization.premiumSeats?.find((seat) => seat.toString() === userId));
    }
    return {
      customerRemoteId: organization.payment.customerRemoteId,
      subscriptionRemoteId: organization.payment.subscriptionRemoteId,
      planRemoteId: productSubscription.planRemoteId,
      type: productSubscription.paymentType || PaymentPlanEnums.FREE,
      period: organization.payment.period,
      status: organization.payment.status,
      quantity: productSubscription.quantity,
      isSignProSeat,
      currency: organization.payment.currency,
      isEnterprise,
      hasSubscription,
    };
  }
}
