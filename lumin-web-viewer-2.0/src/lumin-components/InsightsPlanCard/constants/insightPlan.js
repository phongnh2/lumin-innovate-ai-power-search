import FreePlanImage from 'assets/images/free-plan.svg';
import FreePlanTeamImage from 'assets/images/free-plan-team.svg';
import PremiumPlanImage from 'assets/images/premium-plan.svg';
import PremiumPlanTeamImage from 'assets/images/premium-plan-team.svg';
import { Plans } from 'constants/plan';

const INVITE_TO_COLLABORATE = 'insightPage.inviteCollaborate';

const INVITE_MEMBERS = 'orgDashboardInsight.inviteMembers';

const DISCOVER_LUMIN = 'orgDashboardInsight.discoverLumin';

export const PlanContent = {
  Team: {
    [Plans.FREE]: {
      title: '',
      image: FreePlanTeamImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
    [Plans.TEAM]: {
      title: 'Premium Plan',
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
  },
  Organization: {
    [Plans.FREE]: {
      title: Plans.FREE,
      image: FreePlanImage,
      translationKey: 'orgDashboardInsight.exploreFeature',
    },
    [Plans.BUSINESS]: {
      title: Plans.BUSINESS,
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
    [Plans.ENTERPRISE]: {
      title: Plans.ENTERPRISE,
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
    [Plans.ORG_STARTER]: {
      title: Plans.ORG_STARTER,
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
    [Plans.ORG_PRO]: {
      title: Plans.ORG_PRO,
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
    [Plans.ORG_BUSINESS]: {
      title: Plans.ORG_BUSINESS,
      image: PremiumPlanImage,
      translationKey: INVITE_TO_COLLABORATE,
      btnText: INVITE_MEMBERS,
    },
  },
  OrganizationTeam: {
    [Plans.FREE]: {
      title: Plans.FREE,
      image: FreePlanTeamImage,
      translationKey: 'insightPage.contactAdmin',
    },
    [Plans.BUSINESS]: {
      title: Plans.BUSINESS,
      image: PremiumPlanTeamImage,
      translationKey: DISCOVER_LUMIN,
    },
    [Plans.ENTERPRISE]: {
      title: Plans.ENTERPRISE,
      image: PremiumPlanTeamImage,
      translationKey: DISCOVER_LUMIN,
    },
    [Plans.ORG_STARTER]: {
      title: Plans.ORG_STARTER,
      image: PremiumPlanTeamImage,
      translationKey: DISCOVER_LUMIN,
    },
    [Plans.ORG_PRO]: {
      title: Plans.ORG_PRO,
      image: PremiumPlanTeamImage,
      translationKey: DISCOVER_LUMIN,
    },
    [Plans.ORG_BUSINESS]: {
      title: Plans.ORG_BUSINESS,
      image: PremiumPlanTeamImage,
      translationKey: DISCOVER_LUMIN,
    },
  },
};
