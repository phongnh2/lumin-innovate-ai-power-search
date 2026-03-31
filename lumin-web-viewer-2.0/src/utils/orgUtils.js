import { capitalize } from 'lodash';
import React from 'react';

import BusinessUpgrade from 'assets/images/business-upgrade.svg';
import ContactUpgrade from 'assets/images/contact-upgrade.svg';
import CreateTeam from 'assets/images/create-team.svg';
import EnterpriseUpgrade from 'assets/images/enterprise-upgrade.svg';

import SvgElement from 'luminComponents/SvgElement';

import dateUtil from 'utils/date';
import lastAccessOrgs from 'utils/lastAccessOrgs';

import { BannerType } from 'constants/banner';
import { ORGANIZATION_ROLES, ORGANIZATION_TEXT, ORG_TEXT } from 'constants/organizationConstants';
import { PERIOD, Plans } from 'constants/plan';
import { STATIC_PAGE_URL } from 'constants/urls';

import getCommonBanner from './getCommonBanner';
import { getFullPathWithPresetLang } from './getLanguage';

export const getOrgBannerData = (t) => {
  const commonBanner = getCommonBanner(t);

  return ({
    [BannerType.CREATE_TEAM]: {
      id: BannerType.CREATE_TEAM,
      bannerClass: 'createTeam',
      bannerImage: CreateTeam,
      mainTitle: '',
      subTitle: t('banner.createTeam.subTitle'),
      btnData: {
        btnContent: t('common.createTeam'),
        state: {},
      },
    },
    [BannerType.CONTACT_UPGRADE]: {
      id: BannerType.CONTACT_UPGRADE,
      bannerClass: 'contactUpgrade',
      bannerImage: ContactUpgrade,
      mainTitle: '',
      subTitle: t('banner.contactUpgrade.subTitle'),
      btnData: {
        btnContent: '',
        state: {},
      },
    },
    [BannerType.FOR_FREE_ORG]: {
      id: BannerType.FOR_FREE_ORG,
      bannerClass: 'forFreeOrg',
      bannerImage: BusinessUpgrade,
      mainTitle: '',
      subTitle: t('banner.forFreeOrg.subTitle'),
      btnData: {
        btnContent: t('common.upgradeNow'),
        href: '/plans',
        search: '?period=annual',
        state: {},
      },
    },
    [PERIOD.MONTHLY]: {
      id: BannerType.FOR_PREMIUM_ORG,
      bannerClass: 'forPremiumOrg',
      bannerImage: EnterpriseUpgrade,
      mainTitle: '',
      subTitle: t('banner.forPremiumOrg.subTitle'),
      btnData: {
        btnContent: t('common.contactUs'),
        href: STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale')),
        state: {},
      },
    },
    ...commonBanner,
  });
};

export const getScheduledDeleteOrgModalSettings = ({ userRole, orgName, deletedAt }, onConfirm) => {
  const setting = {
    title: 'Cannot perform this action',
    customIcon: (
      <SvgElement
          content="new-warning"
          className="auto-margin"
          width={68}
          alt="modal_image"
        />),
  };
  if (userRole.toUpperCase() === ORGANIZATION_ROLES.ORGANIZATION_ADMIN) {
    Object.assign(setting, {
      cancelButtonTitle: 'Later',
      confirmButtonTitle: 'Reactivate',
      onCancel: () => {},
      onConfirm,
      message: (
        <p>
          <span className="Container__Content--message-primary">{orgName}</span> {ORGANIZATION_TEXT} will be deleted on {' '}
          <span className="Container__Content--message-bold">{dateUtil.formatMDYTime(deletedAt)}</span>. {' '}
          Reactivate it first to do this action.
        </p>
      ),
    });
  } else {
    Object.assign(setting, {
      confirmButtonTitle: 'OK',
      onConfirm: () => {},
      message: (
        <p>
          <span className="Container__Content--message-primary">{orgName}</span> {ORGANIZATION_TEXT} will be deleted on {' '}
          <span className="Container__Content--message-bold">{dateUtil.formatMDYTime(deletedAt)}</span>. {' '}
          To do this action, contact {capitalize(ORGANIZATION_TEXT)} Admin to reactivate it first.
        </p>
      ),
    });
  }
  return setting;
};

export const getMemberUnit = (memberCount) => (memberCount > 1 ? 'members' : 'member');

export const getMemberText = (memberCount) => `${memberCount} ${getMemberUnit(memberCount)}`;

export const addLastAccessOrg = ({ id, url }) => {
  lastAccessOrgs.setToStorage({ id, url });
};

const regexOrgUrl = new RegExp(`^\\/${ORG_TEXT}|circle\\/[a-z 0-9]{24}(?:\\/.+|$|\\/|\\?.+|#.+)`);

export const isMatchOrgIdPath = (url) => regexOrgUrl.test(url);

const regexOrgDashboardUrl = new RegExp(`^\\/${ORG_TEXT}\\/[a-zA-Z0-9\\-]+\\/dashboard\\/*`);

export const isMatchOrgDashboard = (url) => regexOrgDashboardUrl.test(url);

export const canPaySubscription = (role) =>
  [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(
    role.toUpperCase()
  );

export const getIndexPlan = (plan) => Object.values(Plans).findIndex((trialPlan) => trialPlan === plan);

export const canStartTrialPlan = (plan, trialInfo) => {
  switch (plan?.toUpperCase()) {
    case Plans.ORG_STARTER:
      return trialInfo.canUseStarterTrial;
    case Plans.ORG_PRO:
      return trialInfo.canUseProTrial;
    case Plans.ORG_BUSINESS:
      return trialInfo.canUseBusinessTrial;
    default:
      return false;
  }
};

export const mappingOrgWithRoleAndTeams = (organization) => ({
  organization: { ...organization, teams: organization.teams || [] },
  role: organization.userRole.toLowerCase(),
});
