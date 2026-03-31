import { Text, ScrollArea, Button, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React, { useState, useCallback, useMemo } from 'react';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';
import JoinOrganizationSuccessfully from 'lumin-components/JoinOrganizationSuccessfully';
import { LayoutSecondary } from 'lumin-components/Layout';
import JoinOrganizationItem from 'luminComponents/JoinOrganizationItem';

import withPreventCreateOrganization from 'HOC/withPreventCreateOrganization';

import { useEnableWebReskin, useGetCurrentUser, useMobileMatch, useTranslation } from 'hooks';
import useHideTooltipOnScroll from 'hooks/useHideTooltipOnScroll';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import logger from 'helpers/logger';

import { errorUtils, toastUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { JOIN_ORGANIZATION_STATUS, JOIN_ORGANIZATION_PERMISSION_TYPE } from 'constants/organizationConstants';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import JoinOrganizationContainer from './components/JoinOrganizationContainer';
import OrganizationList from './components/OrganizationList';

import * as Styled from './JoinOrganization.styled';

import styles from './JoinOrganization.module.scss';

const JoinOrganization = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { search } = location;
  const getDirectUrl = useCallback((url) => `${url}${search}`, [search]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mainOrganization = useSelector(selectors.getMainOrganizationCanJoin, shallowEqual);
  const suggestedOrganizations = useSelector(selectors.getSuggestedOrganizations, shallowEqual).data || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoinSuccessfully, setIsJoinSuccessfully] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(location.state?.organization || {});
  const fromNonLuminFlow = Boolean(location.state?.fromNonLuminFlow);
  const hasJoinedOrg = Boolean(location.state?.hasJoinedOrg);
  const { isEnableReskin } = useEnableWebReskin();
  const isMobileMatch = useMobileMatch();

  const [viewportRef, setViewportRef] = useState(null);

  const currentUser = useGetCurrentUser();

  useHideTooltipOnScroll({ container: viewportRef });

  const scrollAreaClassNames = useMemo(
    () => ({
      root: styles.root,
      viewport: styles.viewport,
      scrollbar: styles.scrollbar,
    }),
    []
  );

  const updateJoinSuccessfully = ({ organization, isActionToSameDomainOrg }) => {
    batch(() => {
      setSelectedOrg(organization);
      setIsJoinSuccessfully(true);
      if (isActionToSameDomainOrg) {
        dispatch(actions.removeMainOrganizationCanRequest());
      }
    });
  };

  const onClick = async (org) => {
    setIsSubmitting(true);
    try {
      const { status: suggestedOrgStatus, _id: orgId } = org;
      const isActionToSameDomainOrg = mainOrganization._id === orgId;
      switch (suggestedOrgStatus) {
        case JOIN_ORGANIZATION_STATUS.CAN_REQUEST: {
          const { newOrg } = await organizationServices.sendRequestJoinOrg({ orgId });
          dispatch(actions.addNewOrganization(newOrg));
          const updatedOrganizations = suggestedOrganizations.map((organization) =>
            organization._id === orgId ? { ...organization, status: JOIN_ORGANIZATION_STATUS.REQUESTED } : organization
          );
          batch(() => {
            dispatch(actions.setSuggestedOrganizations(updatedOrganizations));
            if (isActionToSameDomainOrg) {
              dispatch(actions.updateStatusRequestMainOrganization(JOIN_ORGANIZATION_STATUS.REQUESTED));
            }
          });
          orgTracking.trackSelectSuggestedOrganization({
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.REQUEST_ACCESS,
          });
          navigate(getDirectUrl(NEW_AUTH_FLOW_ROUTE.SUBMIT_REQUEST_SUCCESSFULLY), { state: { orgUrl: newOrg.url } });
          break;
        }
        case JOIN_ORGANIZATION_STATUS.CAN_JOIN: {
          const { organization } = await organizationServices.joinOrganization({ orgId });
          updateJoinSuccessfully({ organization, isActionToSameDomainOrg });
          orgTracking.trackSelectSuggestedOrganization({
            suggestedOrganizationId: orgId,
            permissionType: JOIN_ORGANIZATION_PERMISSION_TYPE.JOIN,
          });
          break;
        }
        case JOIN_ORGANIZATION_STATUS.PENDING_INVITE: {
          const { organization } = await organizationServices.acceptOrganizationInvitation({ orgId });
          updateJoinSuccessfully({ organization, isActionToSameDomainOrg });
          orgTracking.trackApproveRequest({ userId: currentUser._id, organization });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      const { message } = errorUtils.extractGqlError(err);
      logger.logError({ error: err, message });
      if (!errorUtils.handleScimBlockedError(err)) {
        toastUtils.openUnknownErrorToast().finally(() => {});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isJoinSuccessfully || (fromNonLuminFlow && hasJoinedOrg)) {
      return <JoinOrganizationSuccessfully isReskin={isEnableReskin} organization={selectedOrg} />;
    }

    if (isEnableReskin) {
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.titleWrapper}>
              <Text type="headline" size={isMobileMatch ? 'lg' : 'xl'} color="var(--kiwi-colors-surface-on-surface)">
                {t('joinOrg.title')}
              </Text>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('joinOrg.description')}
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
                {suggestedOrganizations.map((item) => (
                  <JoinOrganizationItem
                    key={item._id}
                    organization={item}
                    onClick={onClick}
                    isSubmitting={isSubmitting}
                    isReskin={isEnableReskin}
                  />
                ))}
              </div>
            </ScrollArea>
            <div className={styles.footer}>
              <Button
                fullWidth
                size="lg"
                variant="elevated"
                disabled={isSubmitting}
                onClick={() => navigate(getDirectUrl(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION))}
                data-lumin-btn-name={ButtonName.BOARDING_CREATE_NEW_CIRCLE}
                data-lumin-btn-purpose={ButtonPurpose[ButtonName.BOARDING_CREATE_NEW_CIRCLE]}
                startIcon={<KiwiIcomoon type="plus-lg" size="lg" color="var(--kiwi-colors-core-secondary)" />}
              >
                {t('joinOrg.createNewOrg')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Styled.Container>
        <Styled.Paper>
          <Styled.Title>{t('joinOrg.title')}</Styled.Title>
          <Styled.Description>{t('joinOrg.description')}</Styled.Description>

          <OrganizationList
            onItemClick={onClick}
            isSubmitting={isSubmitting}
            list={suggestedOrganizations}
            isReskin={isEnableReskin}
          />
          <Styled.Button
            size={ButtonSize.XL}
            fullWidth
            color={ButtonColor.TERTIARY}
            component={Link}
            to={getDirectUrl(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION)}
            data-lumin-btn-name={ButtonName.BOARDING_CREATE_NEW_CIRCLE}
            data-lumin-btn-purpose={ButtonPurpose[ButtonName.BOARDING_CREATE_NEW_CIRCLE]}
            disabled={isSubmitting}
          >
            <Icomoon className="plus-thin" />
            <Styled.TextButton>{t('joinOrg.createNewOrg')}</Styled.TextButton>
          </Styled.Button>
        </Styled.Paper>
      </Styled.Container>
    );
  };

  return (
    <JoinOrganizationContainer>
      <LayoutSecondary
        footer={false}
        hasBackButton={false}
        canClickLogo={false}
        isReskin={isEnableReskin}
        backgroundColor={isEnableReskin ? 'var(--kiwi-colors-surface-surface-container-low)' : 'transparent'}
      >
        {renderContent()}
      </LayoutSecondary>
    </JoinOrganizationContainer>
  );
};

export default withPreventCreateOrganization(JoinOrganization);
