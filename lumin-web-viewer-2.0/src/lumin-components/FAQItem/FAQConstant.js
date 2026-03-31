/* eslint-disable sonarjs/no-duplicate-string */
import { t } from 'i18next';

import { capitalize } from 'utils';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

const STATIC_PERSONAL_DATA_URL = `${process.env.STATIC_PAGE_URL}${getFullPathWithPresetLang('/personal-data/')}`;

const STATIC_CONTACT_SALE_URL = `${process.env.STATIC_PAGE_URL}${getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}`;

const PAYMENT_OPTIONS_QUESTION = 'What payment options are available?';

const KEEP_DOCUMENTS_SAFE_AND_SECURE_QUESTION = 'How does Lumin keep my documents safe and secure?';

const INVIDIDUAL = [
  {
    summary: PAYMENT_OPTIONS_QUESTION,
    detail: 'Individual plans can be paid using a credit card (Visa, MasterCard, American Express, Diners Club, JCB or Discover).',
  },
  {
    summary: 'How do I upgrade my plan?',
    detail: 'It is possible to upgrade your plan at any time, follow <a href=\'https://help.luminpdf.com/how-do-i-upgrade-to-lumin-pdf-premium\' target=\'_blank\'>this link</a> for further instructions.',
  },
  {
    summary: 'How do I downgrade my plan?',
    detail: 'It is possible to downgrade your plan at any time, follow <a href=\'https://help.luminpdf.com/how-do-i-cancel-my-premium-lumin-pdf-subscription\' target=\'_blank\'>this link</a> for further instructions.',
  },
  {
    summary: 'How many documents can I upload per day?',
    detail: 'On our Free Plan you can upload twenty documents per 24 hours, this is unlimited on our Professional Plan.',
  },
  {
    summary: 'What is the difference between monthly and yearly billing?',
    detail: 'If you choose yearly billing you will save four months on your subscription compared to our monthly option.',
  },
  {
    summary: 'When will my plan renew?',
    detail: 'Your plan will automatically renew at the end of your billing cycle. For example, if you subscribed to a monthly or yearly plan on the 2nd of the month you will always be billed on the 2nd.',
  },
  {
    summary: 'Where can I find my invoices?',
    detail: 'Invoices are available to download in your Billing Settings, follow <a href=\'https://help.luminpdf.com/how-to-download-lumin-pdf-invoices\' target=\'_blank\'>this link</a> for further instructions.',
  },
  {
    summary: 'Can I get a refund if I am not happy with my purchase?',
    detail: 'If you’re not satisfied with any Lumin product or service, we offer a 30-day money-back guarantee. No questions asked.',
  },
  {
    summary: 'Can I add extra users to my plan?',
    detail: `No, to add extra users to your plan you would need to upgrade to an ${capitalize(ORGANIZATION_TEXT)} Plan.`,
  },
  {
    summary: KEEP_DOCUMENTS_SAFE_AND_SECURE_QUESTION,
    detail: `File security is our highest priority, you can head to <a href='${STATIC_PERSONAL_DATA_URL}' target='_blank'>this page</a> to learn more about our security and data policies.`,
  },
];

const ORGANIZATION_BUSINESS = [
  {
    summary: `What is the difference between Free and Business ${ORGANIZATION_TEXT} plans?`,
    detail: `The Business plan gives members access to all of Lumin’s premium features plus ${ORGANIZATION_TEXT} insights, a dedicated account manager and premium security controls.`,
  },
  {
    summary: PAYMENT_OPTIONS_QUESTION,
    detail: 'Business plans can be paid using a credit card (Visa, MasterCard, American Express, Diners Club, JCB or Discover).',
  },
  {
    summary: 'Can I change the number of users on my plan?',
    detail: 'Yes you can, head to your Billing Settings and adjust the slider to the number of users you would like to have.',
  },
  {
    summary: KEEP_DOCUMENTS_SAFE_AND_SECURE_QUESTION,
    detail: `File security is our highest priority, you can head to <a href='${STATIC_PERSONAL_DATA_URL}' target='_blank'>this page</a> to learn more about our security and data policies.`,
  },
  {
    summary: `Are there options for small non-profit ${ORGANIZATION_TEXT}s?`,
    detail: `There sure are! <a href='${STATIC_CONTACT_SALE_URL}' target='_blank'>Get in touch</a> to learn more about what we offer non-profit ${ORGANIZATION_TEXT}s and charities`,
  },
];

const ORGANIZATION_ENTERPRISE = [
  {
    summary: `What is the difference between Business and Enterprise ${ORGANIZATION_TEXT} plans?`,
    detail: `The Enterprise plan is for ${ORGANIZATION_TEXT}s with more than 100 members, we also provide extra onboarding support and other benefits. <a href='${STATIC_CONTACT_SALE_URL}' target='_blank'>Get in touch</a> to find out more.`,
  },
  {
    summary: PAYMENT_OPTIONS_QUESTION,
    detail: 'Enterprise plans can be paid using a credit card (Visa, MasterCard, American Express, Diners Club, JCB or Discover) or bank transfer.',
  },
  {
    summary: 'Can I change the number of users on my plan?',
    detail: 'Yes you can, get in touch with your dedicated account manager to add new users to your plan.',
  },
  {
    summary: KEEP_DOCUMENTS_SAFE_AND_SECURE_QUESTION,
    detail: `File security is our highest priority, you can head to <a href='${STATIC_PERSONAL_DATA_URL}' target='_blank'>this page</a> to learn more about our security and data policies.`,
  },
  {
    summary: `Are there options for large non-profit ${ORGANIZATION_TEXT}s?`,
    detail: `There sure are! <a href='${STATIC_CONTACT_SALE_URL}' target='_blank'>Get in touch</a> to learn more about what we offer non-profit ${ORGANIZATION_TEXT}s and charities.`,
  },
];

export const FAQ_TOPICS = [
  {
    title: 'Individual',
    content: INVIDIDUAL,
  },
  {
    title: `${capitalize(ORGANIZATION_TEXT)} Business`,
    content: ORGANIZATION_BUSINESS,
  },
  {
    title: `${capitalize(ORGANIZATION_TEXT)} Enterprise`,
    content: ORGANIZATION_ENTERPRISE,
  },
];
