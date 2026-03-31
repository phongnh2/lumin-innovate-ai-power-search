/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { t } from 'i18next';

import { ButtonColor } from 'luminComponents/ButtonMaterial/types/ButtonColor';

import { paymentUtil } from 'utils';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { PaymentUrlSerializer } from 'utils/payment';

import { TOTAL_DOC_STACK_FREE_ORG } from 'constants/documentConstants';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { Colors } from 'constants/styles';

import { Plans, DOC_STACK_BLOCK, PRICE } from './plan';
import { STATIC_PAGE_URL } from './urls';

const PlanTextI18n = {
  unlimitCollab: 'plan.unlimitCollab',
  billAnnual: 'plan.billAnnual',
  tryFree: 'plan.tryFree',
  purchase: 'plan.purchase',
  getStarted: 'common.getStarted',
  totalDoc: 'plan.totalDoc',
  perMonth: 'plan.perMonth',
};

export const getPlanBoxList = ({
  currency,
}: {
  currency: PaymentCurrency;
}): {
  data: Record<string, unknown>;
  theme: Record<string, unknown>;
} => {
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);

  return {
    data: {
      [Plans.FREE]: {
        key: Plans.FREE,
        buttonColor: ButtonColor.SECONDARY_BLACK,
        title: 'Free',
        iconTitle: 'unlock',
        description: 'plan.planBox.free.description',
        subDescription: 'plan.planBox.free.subDescription',
        price: `${currencySymbol}${PRICE.FREE} ${currency}`,
        timePrice: PlanTextI18n.perMonth,
        buttonText: PlanTextI18n.getStarted,
        docstack: { key: PlanTextI18n.totalDoc, interpolation: { number: TOTAL_DOC_STACK_FREE_ORG } },
        unlimit: PlanTextI18n.unlimitCollab,
        buttonUrl: Routers.ORGANIZATION_LIST,
        benefitList: 'plan.planBox.free.benefitList',
      },
      [Plans.ORG_STARTER]: {
        key: Plans.ORG_STARTER,
        buttonColor: ButtonColor.SECONDARY_BLACK,
        title: 'Starter',
        iconTitle: 'business',
        description: 'plan.planBox.starter.description',
        subDescription: 'plan.planBox.starter.subDescription',
        price: `${currencySymbol}${PRICE.V3.ANNUAL.ORG_STARTER / 12} ${currency}`,
        timePrice: PlanTextI18n.perMonth,
        warning: PlanTextI18n.billAnnual,
        buttonText: PlanTextI18n.tryFree,
        buttonUrl: new PaymentUrlSerializer().trial(true).plan(Plans.ORG_STARTER).period(PaymentPeriod.ANNUAL).get(),
        subButton: PlanTextI18n.purchase,
        subButtonUrl: new PaymentUrlSerializer().plan(Plans.ORG_STARTER).period(PaymentPeriod.ANNUAL).get(),
        docstack: { key: PlanTextI18n.totalDoc, interpolation: { number: DOC_STACK_BLOCK.MONTHLY.ORG_STARTER } },
        unlimit: PlanTextI18n.unlimitCollab,
        benefitIntro: 'plan.planBox.starter.benefitIntro',
        benefitList: 'plan.planBox.starter.benefitList',
      },
      [Plans.ORG_PRO]: {
        key: Plans.ORG_PRO,
        popular: true,
        buttonColor: ButtonColor.PRIMARY_GREEN,
        title: 'Pro',
        iconTitle: 'medal',
        description: 'plan.planBox.pro.description',
        subDescription: 'plan.planBox.starter.subDescription',
        price: `${currencySymbol}${PRICE.V3.ANNUAL.ORG_PRO / 12} ${currency}`,
        timePrice: PlanTextI18n.perMonth,
        warning: PlanTextI18n.billAnnual,
        buttonText: PlanTextI18n.tryFree,
        buttonUrl: new PaymentUrlSerializer().trial(true).plan(Plans.ORG_PRO).period(PaymentPeriod.ANNUAL).get(),
        subButton: PlanTextI18n.purchase,
        docstack: { key: PlanTextI18n.totalDoc, interpolation: { number: DOC_STACK_BLOCK.MONTHLY.ORG_PRO } },
        unlimit: PlanTextI18n.unlimitCollab,
        subButtonUrl: new PaymentUrlSerializer().plan(Plans.ORG_PRO).period(PaymentPeriod.ANNUAL).get(),
        benefitIntro: 'plan.planBox.pro.benefitIntro',
        benefitList: 'plan.planBox.pro.benefitList',
      },
      [Plans.ORG_BUSINESS]: {
        key: Plans.ORG_BUSINESS,
        buttonColor: ButtonColor.SECONDARY_BLACK,
        title: 'Business',
        iconTitle: 'star-empty',
        description: 'plan.planBox.business.description',
        subDescription: 'plan.planBox.business.subDescription',
        price: `${currencySymbol}${PRICE.V3.ANNUAL.ORG_BUSINESS / 12} ${currency}`,
        timePrice: PlanTextI18n.perMonth,
        warning: PlanTextI18n.billAnnual,
        underlinePrice: true,
        buttonText: PlanTextI18n.tryFree,
        buttonUrl: new PaymentUrlSerializer().trial(true).plan(Plans.ORG_BUSINESS).period(PaymentPeriod.ANNUAL).get(),
        subButton: PlanTextI18n.purchase,
        docstack: { key: PlanTextI18n.totalDoc, interpolation: { number: DOC_STACK_BLOCK.MONTHLY.ORG_BUSINESS } },
        unlimit: PlanTextI18n.unlimitCollab,
        subButtonUrl: new PaymentUrlSerializer().plan(Plans.ORG_BUSINESS).period(PaymentPeriod.ANNUAL).get(),
        benefitIntro: 'plan.planBox.business.benefitIntro',
        benefitList: 'plan.planBox.business.benefitList',
      },
      [Plans.ENTERPRISE]: {
        key: Plans.ENTERPRISE,
        buttonColor: ButtonColor.SECONDARY_BLACK,
        title: 'Enterprise',
        iconTitle: 'star-empty',
        description: 'plan.planBox.enterprise.description',
        subDescription: 'plan.planBox.enterprise.subDescription',
        warning: PlanTextI18n.billAnnual,
        underlinePrice: true,
        buttonText: 'plan.planEnterprise.talkToSales',
        buttonUrl: `${STATIC_PAGE_URL}${getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}`,
        subButton: PlanTextI18n.purchase,
        unlimit: PlanTextI18n.unlimitCollab,
        benefitIntro: 'plan.planBox.enterprise.benefitIntro',
        benefitList: [],
      },
    },
    theme: {
      [Plans.FREE]: {
        backgroundColor: Colors.WHITE,
        borderColor: Colors.NEUTRAL_20,
        dividerColor: Colors.NEUTRAL_20,
      },
      [Plans.ORG_STARTER]: {
        backgroundColor: Colors.OTHER_13,
        borderColor: Colors.OTHER_16,
        buttonColor: Colors.PRIMARY_90,
      },
      [Plans.ORG_PRO]: {
        backgroundColor: Colors.OTHER_22,
        borderColor: Colors.PRIMARY_90,
      },
      [Plans.ORG_BUSINESS]: {
        backgroundColor: Colors.WARNING_10,
        borderColor: Colors.WARNING_50,
      },
    },
  };
};

export const LIMIT_DOCUMENT_CONTENT_TOOLTIP = 'plan.planBox.limitDocumentTooltip';

export const ADDITIONAL_INFO_CONTENT_TOOLTIP = 'plan.planBox.additionalInfo';

export const CATEGORY_FEATURE = {
  DEFAULT: 'plan.categoryFeature.default',
  TOOLS: 'plan.categoryFeature.tools',
  PRODUCTIVITY_INSIGHTS: 'plan.categoryFeature.productInsight',
  SECURITY: 'plan.categoryFeature.security',
  SUPPORT: 'plan.categoryFeature.support',
};

export const PRICING_FEATURES = {
  [CATEGORY_FEATURE.DEFAULT]: {
    PRICE_PER_MONTH: {
      title: 'plan.feature.default.perMonth.title',
    },
    DOCUMENT_STACK: {
      title: 'plan.feature.default.documentStack.title',
      tooltip: 'plan.feature.default.documentStack.tooltip',
    },
  },
  [CATEGORY_FEATURE.TOOLS]: {
    ADD_TEXT_BOXES: {
      title: 'plan.feature.tools.addText.title',
      tooltip: 'plan.feature.tools.addText.tooltip',
    },
    ADD_SHAPES: {
      title: 'plan.feature.tools.addShape.title',
      tooltip: 'plan.feature.tools.addShape.tooltip',
    },
    ADD_IMAGES: {
      title: 'plan.feature.tools.addImage.title',
      tooltip: 'plan.feature.tools.addImage.tooltip',
    },
    FREEHAND_DRAWING: {
      title: 'plan.feature.tools.freeHandDraw.title',
      tooltip: 'plan.feature.tools.freeHandDraw.tooltip',
    },
    HIGHLIGHT_TEXT: {
      title: 'plan.feature.tools.highlightText.title',
      tooltip: 'plan.feature.tools.highlightText.tooltip',
    },
    SIGN_DOCUMENTS: {
      title: 'plan.feature.tools.signDocument.title',
      tooltip: 'plan.feature.tools.signDocument.tooltip',
    },
    TEMPLATE_DISCOVERY: {
      title: 'plan.feature.tools.templateDiscovery.title',
      tooltip: 'plan.feature.tools.templateDiscovery.tooltip',
    },
    EDIT_PDF_CONTENT: {
      title: 'plan.feature.tools.editContent.title',
      tooltip: 'plan.feature.tools.editContent.tooltip',
    },
    ADD_FILLABLE_FIELD: {
      title: 'plan.feature.tools.addFill.title',
      tooltip: 'plan.feature.tools.addFill.tooltip',
    },
    REDACT: {
      title: 'plan.feature.tools.redact.title',
      tooltip: 'plan.feature.tools.redact.tooltip',
    },
    AUTOSYNC: {
      title: 'plan.feature.tools.autoSync.title',
      tooltip: 'plan.feature.tools.autoSync.tooltip',
    },
    MERGE_DOCUMENTS: {
      title: 'plan.feature.tools.mergeDocument.title',
      tooltip: 'plan.feature.tools.mergeDocument.tooltip',
    },
    SPLIT_OR_REMOVE_PAGES: {
      title: 'plan.feature.tools.splitPage.title',
      tooltip: 'plan.feature.tools.splitPage.tooltip',
    },
    RESTORE_ORIGINAL_FILE: {
      title: 'plan.feature.tools.restoreOriginalFile.title',
      tooltip: 'plan.feature.tools.restoreOriginalFile.tooltip',
    },
  },
  [CATEGORY_FEATURE.PRODUCTIVITY_INSIGHTS]: {
    TEAM_INSIGHTS: {
      title: 'plan.feature.productInsight.teamInsight.title',
      tooltip: 'plan.feature.productInsight.teamInsight.tooltip',
    },
  },
  [CATEGORY_FEATURE.SECURITY]: {
    ACCOUNT_ENCRYPTION: {
      title: 'plan.feature.security.accountEncryption.title',
      tooltip: 'plan.feature.security.accountEncryption.tooltip',
    },
    PREMIUM_SECURITY_CONTROL: {
      title: 'plan.feature.security.premiumSecurity.title',
      tooltip: 'plan.feature.security.premiumSecurity.tooltip',
    },
  },
  [CATEGORY_FEATURE.SUPPORT]: {
    DEDICATED_ACCOUNT_MANAGER: {
      title: 'plan.feature.support.accountManager.title',
      tooltip: 'plan.feature.support.accountManager.tooltip',
    },
  },
};

export const FEATURE_TYPE = {
  TEXT: 'text',
  PRICE: 'price',
  CHECKED_ICON: 'checked_icon',
};

export const FREE_PLAN_FEATURES = {
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].PRICE_PER_MONTH.title]: {
    type: FEATURE_TYPE.PRICE,
    value: PRICE.FREE,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].DOCUMENT_STACK.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'plan.planExplain.docsFreePerMonth',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].ADD_TEXT_BOXES.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].ADD_SHAPES.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].ADD_IMAGES.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].FREEHAND_DRAWING.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].HIGHLIGHT_TEXT.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].SIGN_DOCUMENTS.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].TEMPLATE_DISCOVERY.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].AUTOSYNC.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].MERGE_DOCUMENTS.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.SECURITY].ACCOUNT_ENCRYPTION.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
};

export const STARTER_PLAN_FEATURES = {
  ...FREE_PLAN_FEATURES,
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].PRICE_PER_MONTH.title]: {
    type: FEATURE_TYPE.PRICE,
    value: PRICE.V3.ANNUAL.ORG_STARTER / 12,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].DOCUMENT_STACK.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'plan.planExplain.docsStarterPerMonth',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.PRODUCTIVITY_INSIGHTS].TEAM_INSIGHTS.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
};

export const PRO_PLAN_FEATURES = {
  ...STARTER_PLAN_FEATURES,
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].PRICE_PER_MONTH.title]: {
    type: FEATURE_TYPE.PRICE,
    value: PRICE.V3.ANNUAL.ORG_PRO / 12,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].DOCUMENT_STACK.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'plan.planExplain.docsProPerMonth',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].EDIT_PDF_CONTENT.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].SPLIT_OR_REMOVE_PAGES.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].RESTORE_ORIGINAL_FILE.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
};

export const BUSINESS_PLAN_FEATURES = {
  ...PRO_PLAN_FEATURES,
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].PRICE_PER_MONTH.title]: {
    type: FEATURE_TYPE.PRICE,
    value: PRICE.V3.ANNUAL.ORG_BUSINESS / 12,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].DOCUMENT_STACK.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'plan.planExplain.docsBusinessPerMonth',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].ADD_FILLABLE_FIELD.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.TOOLS].REDACT.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.SECURITY].PREMIUM_SECURITY_CONTROL.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
};

export const ENTERPRISE_PLAN_FEATURES = {
  ...BUSINESS_PLAN_FEATURES,
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].PRICE_PER_MONTH.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'common.contactUs',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.DEFAULT].DOCUMENT_STACK.title]: {
    type: FEATURE_TYPE.TEXT,
    value: 'common.contactUs',
  },
  [PRICING_FEATURES[CATEGORY_FEATURE.SUPPORT].DEDICATED_ACCOUNT_MANAGER.title]: {
    type: FEATURE_TYPE.CHECKED_ICON,
  },
};

export const ALL_PLAN_FEATURES = {
  [Plans.FREE]: FREE_PLAN_FEATURES,
  [Plans.ORG_STARTER]: STARTER_PLAN_FEATURES,
  [Plans.ORG_PRO]: PRO_PLAN_FEATURES,
  [Plans.ORG_BUSINESS]: BUSINESS_PLAN_FEATURES,
  [Plans.ENTERPRISE]: ENTERPRISE_PLAN_FEATURES,
};

export const PLAN_CONFIG = [
  { plan: Plans.FREE, color: Colors.WHITE },
  { plan: Plans.ORG_STARTER, color: Colors.OTHER_13 },
  { plan: Plans.ORG_PRO, color: Colors.OTHER_22 },
  { plan: Plans.ORG_BUSINESS, color: Colors.WARNING_10 },
  { plan: Plans.ENTERPRISE, color: Colors.OTHER_14 },
];
