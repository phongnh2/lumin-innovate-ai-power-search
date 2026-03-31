import { ScrollArea, Text, Button } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router';
import { v4 } from 'uuid';

import FindSomethingImage from 'assets/reskin/images/find-something.png';

import actions from 'actions';
import selectors from 'selectors';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'luminComponents/ButtonMaterial';
import JoinOrganizationItem from 'luminComponents/JoinOrganizationItem';
import { LayoutSecondary } from 'luminComponents/Layout';
import Loading from 'luminComponents/Loading';

import { useEnableWebReskin, useGetCurrentUser, useMobileMatch, useTranslation } from 'hooks';
import useHideTooltipOnScroll from 'hooks/useHideTooltipOnScroll';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import { getDefaultOrgUrl, getTrendingUrl } from 'utils/orgUrlUtils';

import { JOIN_ORGANIZATION_PERMISSION_TYPE, JOIN_ORGANIZATION_STATUS } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import { SuggestedPremiumOrganization } from 'interfaces/organization/organization.interface';

import { useGetSuggestedOrgList } from './hooks/useGetSuggestedOrgList';
import * as JoinOrgStyled from '../JoinOrganization/JoinOrganization.styled';

import * as Styled from './JoinOrganizations.styled';

import styles from './JoinOrganizations.module.scss';

function JoinOrganizations(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const suggestIdRef = useRef<string>(null);
  const [viewportRef, setViewportRef] = useState<HTMLDivElement | null>(null);
  const mainOrganization = useSelector(selectors.getMainOrganizationCanJoin, shallowEqual);

  const isMobileMatch = useMobileMatch();
  const { isEnableReskin } = useEnableWebReskin();

  useHideTooltipOnScroll({ container: viewportRef });

  const getSuggestId = () => {
    if (suggestIdRef.current !== null) {
      return suggestIdRef.current;
    }
    const id = v4();
    suggestIdRef.current = id;
    return id;
  };

  const suggestId = getSuggestId();
  const { premiumOrgList, loading, setPremiumOrgList } = useGetSuggestedOrgList({
    suggestId,
  });

  const scrollAreaClassNames = useMemo(
    () => ({
      root: styles.root,
      viewport: styles.viewport,
      scrollbar: styles.scrollbar,
    }),
    []
  );

  const onItemClick = async ({ org, position }: { org: SuggestedPremiumOrganization; position: number }) => {
    try {
      const { joinStatus: suggestedOrgStatus, _id: orgId, paymentType, paymentPeriod, paymentStatus } = org;

      switch (suggestedOrgStatus) {
        case JOIN_ORGANIZATION_STATUS.CAN_REQUEST: {
          const { newOrg } = await organizationServices.sendRequestJoinOrg({ orgId });
          toastUtils.success({ message: t('joinOrgs.requestSubmitted') });
          const updatedOrganizations = premiumOrgList.map((organization) =>
            organization._id === orgId
              ? { ...organization, joinStatus: JOIN_ORGANIZATION_STATUS.REQUESTED }
              : organization
          );
          setPremiumOrgList(updatedOrganizations as SuggestedPremiumOrganization[]);
          orgTracking.trackSelectSuggestedOrganization({
            position,
            suggestId,
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
            paymentType,
            paymentStatus,
            paymentPeriod,
          });
          if (newOrg) {
            dispatch(actions.addNewOrganization(newOrg));
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: newOrg.url }));
            navigate(getDefaultOrgUrl({ orgUrl: newOrg.url }));
            break;
          }
          navigate(Routers.ROOT);
          break;
        }
        case JOIN_ORGANIZATION_STATUS.CAN_JOIN: {
          const { organization } = await organizationServices.joinOrganization({ orgId });
          toastUtils.success({ message: t('joinOrgs.joinSuccessfully') });
          orgTracking.trackSelectSuggestedOrganization({
            position,
            suggestId,
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
            paymentType,
            paymentStatus,
            paymentPeriod,
          });
          if (mainOrganization && mainOrganization._id === organization._id) {
            dispatch(actions.removeMainOrganizationCanRequest());
          }
          dispatch(actions.addNewOrganization(organization));
          if (!currentUser.hasJoinedOrg) {
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
          }
          navigate(getTrendingUrl({ orgUrl: organization.url }));
          break;
        }
        case JOIN_ORGANIZATION_STATUS.PENDING_INVITE: {
          const { organization } = await organizationServices.acceptOrganizationInvitation({ orgId });
          dispatch(actions.addNewOrganization(organization));
          if (!currentUser.hasJoinedOrg) {
            dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
          }
          toastUtils.success({ message: t('joinOrgs.inviteAccepted') });
          navigate(getDefaultOrgUrl({ orgUrl: organization.url }));
          break;
        }
        default:
          break;
      }
    } catch (err) {
      const { message } = errorUtils.extractGqlError(err) as { message: string; code: string };
      logger.logError({ error: err, message });
      if (!errorUtils.handleScimBlockedError(err)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Loading useReskinCircularProgress={isEnableReskin} normal />;
    }
    if (!premiumOrgList.length) {
      if (isEnableReskin) {
        return (
          <div className={styles.emptyListWrapper}>
            <img src={FindSomethingImage} alt="Find Something" />
            <div className={styles.emptyListContent}>
              <Text type="headline" size={isMobileMatch ? 'lg' : 'xl'} color="var(--kiwi-colors-surface-on-surface)">
                {t('joinOrgs.emptyTitle')}
              </Text>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                {t('joinOrgs.emptyDescription')}
              </Text>
            </div>
            <div className={styles.emptyListActions}>
              <Button
                size="lg"
                variant="outlined"
                onClick={() => (window.location.href = `${STATIC_PAGE_URL}/form-templates`)}
              >
                {t('joinOrgs.explorePublicTemplates')}
              </Button>
              <Button size="lg" variant="filled" onClick={() => navigate(Routers.ORGANIZATION_CREATE)}>
                {t('listOrgs.createANewOrg')}
              </Button>
            </div>
          </div>
        );
      }
      return (
        <>
          <Styled.Title>{t('joinOrgs.emptyTitle')}</Styled.Title>
          <JoinOrgStyled.Description>{t('joinOrgs.emptyDescription')}</JoinOrgStyled.Description>
          <Styled.ButtonGroup>
            <ButtonMaterial
              color={ButtonColor.PRIMARY_BLACK}
              size={ButtonSize.XL}
              onClick={() => navigate(Routers.ORGANIZATION_CREATE)}
            >
              {t('listOrgs.createANewOrg')}
            </ButtonMaterial>
            <Styled.Link onClick={() => (window.location.href = `${STATIC_PAGE_URL}/form-templates`)}>
              {t('joinOrgs.explorePublicTemplates')}
            </Styled.Link>
          </Styled.ButtonGroup>
        </>
      );
    }
    if (isEnableReskin) {
      return (
        <div className={styles.content}>
          <div className={styles.titleWrapper}>
            <Text type="headline" size={isMobileMatch ? 'lg' : 'xl'} color="var(--kiwi-colors-surface-on-surface)">
              {t('joinOrgs.title')}
            </Text>
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('joinOrgs.description')}
            </Text>
          </div>
          <ScrollArea
            type="auto"
            viewportRef={(ref) => setViewportRef(ref)}
            offsetScrollbars="x"
            scrollbars="y"
            classNames={scrollAreaClassNames}
          >
            <div className={styles.listItemWrapper}>
              {premiumOrgList.map((item, index) => (
                <JoinOrganizationItem
                  key={item._id}
                  organization={item}
                  onClick={(org: SuggestedPremiumOrganization) => onItemClick({ org, position: index })}
                  isSubmitting={isSubmitting}
                  isReskin={isEnableReskin}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    }
    return (
      <>
        <Styled.Title>{t('joinOrgs.title')}</Styled.Title>
        <JoinOrgStyled.Description>{t('joinOrgs.description')}</JoinOrgStyled.Description>
        <Styled.List>
          {premiumOrgList.map((item, index) => (
            <JoinOrganizationItem
              key={item._id}
              organization={item}
              onClick={(org: SuggestedPremiumOrganization) => onItemClick({ org, position: index })}
              isSubmitting={isSubmitting}
            />
          ))}
        </Styled.List>
      </>
    );
  };

  return (
    <LayoutSecondary
      footer={false}
      hasBackButton={false}
      canClickLogo={false}
      isReskin={isEnableReskin}
      backgroundColor={isEnableReskin ? 'var(--kiwi-colors-surface-surface-container-low)' : 'transparent'}
    >
      {isEnableReskin ? (
        <div className={styles.container}>{renderContent()}</div>
      ) : (
        <Styled.Container>
          <Styled.Paper>{renderContent()}</Styled.Paper>
        </Styled.Container>
      )}
    </LayoutSecondary>
  );
}

export default JoinOrganizations;
