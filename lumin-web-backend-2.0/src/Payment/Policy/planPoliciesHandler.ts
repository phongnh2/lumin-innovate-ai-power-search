import { AvailableCompressQuality } from 'graphql.schema';
import { PaymentPlanEnums, PlanRules } from 'Payment/payment.enum';
import * as policyData from 'Payment/Policy/planPolicies.json';

export interface IPlanRules {
  passwordProtected: boolean;
  docStack: number;
  signatures: number;
  signedDoc: number | string;
  watermark: boolean;
  formBuilder: boolean;
  autoSync: boolean;
  editPDFContent: boolean;
  splitPage: boolean;
  mergePage: boolean;
  rotatePage: boolean;
  deletePage: boolean;
  movePage: boolean;
  insertPage: boolean;
  cropPage: boolean;
  highlight: boolean;
  freeHand: boolean;
  freeText: boolean;
  redaction: boolean;
  shape: boolean;
  stamp: boolean;
  textTool: boolean;
  comment: boolean;
  eraser: boolean;
  docSize: number;
  restoreOriginal: boolean;
  ocr: boolean;
  dotStamp: boolean;
  crossStamp: boolean;
  tickStamp: boolean;
  documentVersioning: {
    quantity: number;
    maximumSaveTime: number;
    maximumSaveTimeUnit: string;
  };
  documentSummarization: {
    enabled: boolean;
    maxPages: number;
  };
  visibilitySetting: {
    inviteOnly: boolean;
    visibleAutoApprove: boolean;
    visibleNeedApprove: boolean;
  }
  inviteSetting: {
    administratorsCanInvite: boolean;
    allMembersCanInvite: boolean;
  },
  externalSync: {
    oneDrive: boolean;
  },
  multipleMerge: boolean;
  compressPdf: {
    enabled: boolean;
    fileSizeLimitInMB: number;
    availableCompressQuality: AvailableCompressQuality[];
  },
  aiChatbot: {
    daily: number;
    attachedFilesSizeLimitInMB: number;
  },
  organizationTeamLimit: number;
  autoDetection: {
    priority: number;
  },
}

const PLANS_MAPPING = {
  FREE: 'free',
  PERSONAL: 'userPersonal',
  PROFESSIONAL: 'userProfessional',
  BUSINESS: 'orgOldBusiness',
  ORG_STARTER: 'orgStarter',
  ORG_PRO: 'orgProfessional',
  ORG_BUSINESS: 'orgBusiness',
  ENTERPRISE: 'orgOldEnterprise',
};

class PlanPoliciesHandler {
  private plans: Record<string, IPlanRules>;

  private currentPlan: IPlanRules;

  private planName: PaymentPlanEnums;

  constructor() {
    const { plans } = policyData.policies;
    const plansMapping = Object.keys(plans).map((plan) => {
      if (plans[plan].features) {
        return {
          [plan]: {
            ...plans[plan].features,
          },
        };
      }
      return {
        [`${plan}_monthly`]: {
          ...plans[plan].monthly.features,
        },
        [`${plan}_annual`]: {
          ...plans[plan].annual.features,
        },
      };
    });
    this.plans = Object.assign({}, ...plansMapping);
  }

  public from(params: { plan: string, period: string }): PlanPoliciesHandler {
    const { plan, period } = params;
    this.currentPlan = plan !== PaymentPlanEnums.FREE
      ? this.plans[`${PLANS_MAPPING[plan]}_${period.toLowerCase()}`]
      : this.plans[PLANS_MAPPING[plan]];
    this.planName = plan as PaymentPlanEnums;
    return this;
  }

  public getPlanRule(rule: PlanRules): string | number | boolean {
    return this.currentPlan[rule];
  }

  /**
 * @deprecated This method will be removed later.
 */
  public getAllPlanRules(): IPlanRules {
    return this.currentPlan;
  }

  public getDocStack(quantity: number = 1): number {
    if ([PaymentPlanEnums.BUSINESS, PaymentPlanEnums.ENTERPRISE].includes(this.planName)) {
      return Infinity;
    }
    if (typeof quantity === 'number') {
      return Number(this.currentPlan.docStack) * quantity;
    }
    return Number(this.currentPlan.docStack);
  }

  public getNumberSignature(): number {
    return this.currentPlan.signatures;
  }

  public getRestoreOriginalToolPermission(): boolean {
    return this.currentPlan.restoreOriginal;
  }

  public getOCRToolPermission(): boolean {
    return this.currentPlan.ocr;
  }

  public getDocumentVersioningRules() {
    return this.currentPlan.documentVersioning;
  }

  public getDocumentSummarizationPermission(): IPlanRules['documentSummarization'] {
    return this.currentPlan.documentSummarization;
  }

  public getVisibilitySettingPermission(): IPlanRules['visibilitySetting'] {
    return this.currentPlan.visibilitySetting;
  }

  public getInviteSettingPermission(): IPlanRules['inviteSetting'] {
    return this.currentPlan.inviteSetting;
  }

  public getCanUseMultipleMerge(): IPlanRules['multipleMerge'] {
    return this.currentPlan.multipleMerge;
  }

  public getAIChatbotDailyLimit(): number {
    return this.currentPlan.aiChatbot.daily;
  }

  public getOrganizationTeamLimit(): number {
    return this.currentPlan.organizationTeamLimit;
  }

  public getCompressPdfSizeLimitInMB(): number {
    return this.currentPlan.compressPdf.fileSizeLimitInMB;
  }

  public getAutoDetectionPriority(): number {
    return this.currentPlan.autoDetection.priority;
  }
}

export default new PlanPoliciesHandler();
