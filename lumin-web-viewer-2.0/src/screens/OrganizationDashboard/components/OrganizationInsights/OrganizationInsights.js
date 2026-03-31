import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, batch } from 'react-redux';
import { compose } from 'redux';

import ChampionFeature from 'assets/lumin-svgs/f-champions.svg';
import ViewMembersFeature from 'assets/lumin-svgs/f-view-members.svg';
import ViewMetricsFeature from 'assets/lumin-svgs/f-view-metrics.svg';

import selectors from 'selectors';

import { PlanContent } from 'lumin-components/InsightsPlanCard/constants/insightPlan';
import DashboardCard from 'luminComponents/DashboardCard';
import DashboardCardStat from 'luminComponents/DashboardCardStat';
import InsightsPlanCard from 'luminComponents/InsightsPlanCard';
import InsightsStats from 'luminComponents/InsightsStats';
import PieChart from 'luminComponents/PieChart';

import { useIsMountedRef, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { toastUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { PaymentUrlSerializer } from 'utils/payment';

import { CARD_MODE, DASHBOARD_ACTION, DASHBOARD_TYPE } from 'constants/dashboardConstants';
import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_CREATION_TYPE, ORG_TEXT } from 'constants/organizationConstants';
import { Plans } from 'constants/plan';
import { STATIC_PAGE_PRICING } from 'constants/Routers';
import { Colors } from 'constants/styles';

import RecentAddedMember from './RecentAddedMember';
import FreeOrganizationAdvertisement from '../Shared/FreeOrganizationAdvertisement';
import withDashboardWindowTitle from '../withDashboardWindowTitle';

import {
  StyledInsightsContainer,
  StyledInsightsLayout,
  StyledInsightsMembers,
  StyledInsightsRight,
  StyledMembersLeft,
  StyledMembersRight,
  StyledMembersContent,
  StyledRecentlyAddedHeader,
  StyledAddedText,
  StyledViewMembersLink,
  StyledInsightsPlan,
  StyledInsightsPlanDesktop,
  RecentlyContainer,
  StyledLastUpdateOnTab,
} from './OrganizationInsights.styled';

const features = [
  {
    id: 'metrics',
    image: ViewMetricsFeature,
    description: 'orgDashboardInsight.metricsDescription',
  },
  {
    id: 'champions',
    image: ChampionFeature,
    description: 'orgDashboardInsight.championsDescription',
  },
  {
    id: 'members',
    image: ViewMembersFeature,
    description: 'orgDashboardInsight.membersDescription',
  },
];

const SEGMENT_TYPES = {
  MEMBERS: 'MEMBERS',
  GUEST: 'GUEST',
  PENDING: 'PENDING',
};

const MEMBER_SEGMENTS = {
  [SEGMENT_TYPES.MEMBERS]: {
    name: 'common.memberS',
    value: 0,
    color: Colors.PRIMARY_40,
  },
  [SEGMENT_TYPES.GUEST]: {
    name: 'common.guestS',
    value: 0,
    color: Colors.OTHER_2,
  },
  [SEGMENT_TYPES.PENDING]: {
    name: 'common.pendingUserS',
    value: 0,
    color: Colors.PRIMARY_90,
  },
};

const propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  setRightElement: PropTypes.func.isRequired,
};
const defaultProps = {};

const getFormatLastUpdated = (date) => dayjs(parseInt(date)).format('LL');

const OrganizationInsights = ({
  currentOrganization,
  setRightElement,
}) => {
  const { t } = useTranslation();
  const { url, _id, payment: { type } } = currentOrganization;
  const orgOriginUrl = `/${ORG_TEXT}/${url}`;
  const [loading, setLoading] = useState(true);
  const [memberStat, setMemberStat] = useState(null);
  const [documentStat, setDocumentStat] = useState(null);
  const [annotationStat, setAnnotationStat] = useState(null);
  const [signatureStat, setSignatureStat] = useState(null);
  const isMounted = useIsMountedRef();

  const isFreeOrganization = type === Plans.FREE;

  const dashboardCardListData = [
    {
      card: {
        title: t('common.documents'),
        icon: 'org-document',
        size: 24,
        tooltipContent: t('orgDashboardInsight.numberOfDocumentUploaded'),
      },
      statistics: {
        data: documentStat?.dailyNewDocuments,
        value: documentStat?.totalDocuments,
        rating: documentStat?.rate,
        text: t('insightPage.totalDocuments'),
      },
    },
    {
      card: {
        title: t('common.annotations'),
        icon: 'select',
        size: 24,
        tooltipContent: t('orgDashboardInsight.numberOfAnnotationsCreated'),
      },
      statistics: {
        data: annotationStat?.dailyNewAnnotations,
        value: annotationStat?.totalAnnotations,
        rating: annotationStat?.rate,
        text: t('insightPage.totalAnnotations'),
      },
    },
    {
      card: {
        title: t('insightPage.eSignatures'),
        icon: 'signature',
        size: 20,
        tooltipContent: t('orgDashboardInsight.numberOfESignatures'),
      },
      statistics: {
        data: signatureStat?.dailyNewSignatures,
        value: signatureStat?.totalSignatures,
        rating: signatureStat?.rate,
        text: t('insightPage.totalESignatures'),
      },
    },
  ];

  const updateRightElement = (date) => {
    const element = <StyledLastUpdateOnTab>{t('common.lastUpdated')}: {date}</StyledLastUpdateOnTab>;
    setRightElement(element);
  };

  useEffect(() => {
    const getInsightsData = async () => {
      try {
        setLoading(true);
        const {
          organizationMembers,
          organizationDocuments,
          organizationAnnotations,
          organizationSignatures,
          lastUpdated: lastUpdatedInsight,
        } = await organizationServices.getOrganizationInsights(_id);
        if (!isMounted.current) {
          return;
        }
        const formatDate = getFormatLastUpdated(lastUpdatedInsight);
        batch(() => {
          setMemberStat(organizationMembers);
          setDocumentStat(organizationDocuments);
          setAnnotationStat(organizationAnnotations);
          setSignatureStat(organizationSignatures);
          updateRightElement(formatDate);
          setLoading(false);
        });
      } catch (e) {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          message: t('orgDashboardInsight.failedToGetInsightData'),
        });
      }
    };
    !isFreeOrganization && getInsightsData();
    return () => {
      setRightElement(null);
    };
  }, []);

  const getMemberSegments = () => {
    const segments = cloneDeep(MEMBER_SEGMENTS);
    const { memberCount = {} } = memberStat || {};
    segments[SEGMENT_TYPES.MEMBERS].value = memberCount.member;
    segments[SEGMENT_TYPES.GUEST].value = memberCount.guest;
    segments[SEGMENT_TYPES.PENDING].value = memberCount.pending;
    if (currentOrganization.creationType === ORGANIZATION_CREATION_TYPE.MANUAL) {
      Reflect.deleteProperty(segments, SEGMENT_TYPES.GUEST);
      segments[SEGMENT_TYPES.MEMBERS].value = memberCount.member + memberCount.guest;
    }

    return Object.values(segments);
  };

  const getRecentlyAddedMembers = () => {
    const { recentAdded } = memberStat || {};

    return (recentAdded || []).map((member) => ({
      _id: member.user._id,
      name: member.user.name,
      email: member.user.email,
      avatarRemoteId: member.user.avatarRemoteId,
      joinDate: member.joinDate,
    }));
  };

  const renderAddedMembers = () => {
    const recentlyAddedMembers = getRecentlyAddedMembers();
    const listMembers = loading ? Array.from(Array(3).keys()).map((id) => ({ _id: id })) : recentlyAddedMembers;
    return (
      <>
        {
          listMembers.map((user) => <RecentAddedMember key={user._id} user={user} loading={loading} />)
        }
      </>
    );
  };

  if (isFreeOrganization) {
    const urlSerializer = new PaymentUrlSerializer();
    return <FreeOrganizationAdvertisement
      header={t('orgDashboardInsight.freeOrg.header')}
      description={t('orgDashboardInsight.freeOrg.description')}
      features={features}
      upgradeUrl={urlSerializer.of(_id).returnUrlParam().default}
      learnMoreUrl={STATIC_PAGE_PRICING}
      buttonName={ButtonName.ORG_PAYMENT_REDIRECT_FROM_INSIGHTS_DASHBOARD}
      buttonPurpose={ButtonPurpose[ButtonName.ORG_PAYMENT_REDIRECT_FROM_INSIGHTS_DASHBOARD]}
    />;
  }

  const memberSegments = getMemberSegments();
  const planData = PlanContent.Organization[type];
  const inviteNewMemberLink = `${orgOriginUrl}/members?action=${DASHBOARD_ACTION.INVITE_MEMBERS}`;
  return (
    <StyledInsightsContainer>
      <StyledInsightsLayout>
        <StyledInsightsMembers>
          <DashboardCard
            iconName="members"
            iconSize={24}
            title={t('common.members')}
            rightIcon="add-member"
            rightText={t('orgDashboardInsight.inviteMembers')}
            rightLink={inviteNewMemberLink}
          >
            <div>
              <StyledMembersContent>
                <StyledMembersLeft>
                  <InsightsStats
                    value={memberStat?.totalMembers}
                    title={t('orgDashboardInsight.totalMembers')}
                    rating={Math.abs(memberStat?.rate)}
                    isIncrease={memberStat?.rate >= 0}
                    loading={loading}
                    isDocument
                  />
                </StyledMembersLeft>

                <StyledMembersRight>
                  <PieChart
                    segments={memberSegments}
                    loading={loading}
                  />
                </StyledMembersRight>
              </StyledMembersContent>
              <RecentlyContainer>
                <StyledRecentlyAddedHeader>
                  <StyledAddedText>{t('orgDashboardInsight.recentlyAddedMembers')}</StyledAddedText>
                  <StyledViewMembersLink to={`${orgOriginUrl}/members`}>
                    {t('orgDashboardInsight.viewAll')}
                  </StyledViewMembersLink>
                </StyledRecentlyAddedHeader>
                <div
                  style={{ paddingBottom: '8px' }}
                >
                  {renderAddedMembers()}
                </div>
              </RecentlyContainer>
            </div>
          </DashboardCard>
        </StyledInsightsMembers>
        <StyledInsightsRight>
          {dashboardCardListData.map(({ card, statistics }, idx) => (
            <DashboardCardStat
              key={idx}
              card={card}
              statistics={statistics}
              loading={loading}
            />
          ))}
          <StyledInsightsPlan>
            <InsightsPlanCard
              type={DASHBOARD_TYPE.ORGANIZATION}
              mode={CARD_MODE.VERTICAL}
              planContent={planData}
              customImgClassName="InsightsPlanCard__Img--organization"
            />
          </StyledInsightsPlan>
        </StyledInsightsRight>
        <StyledInsightsPlanDesktop>
          <InsightsPlanCard
            type={DASHBOARD_TYPE.ORGANIZATION}
            mode={CARD_MODE.VERTICAL}
            planContent={planData}
            customImgClassName="InsightsPlanCard__Img--organization"
          />
        </StyledInsightsPlanDesktop>
      </StyledInsightsLayout>
    </StyledInsightsContainer>
  );
};

OrganizationInsights.propTypes = propTypes;
OrganizationInsights.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state).data,
});

export default compose(
  withDashboardWindowTitle,
  connect(mapStateToProps),
)(OrganizationInsights);
