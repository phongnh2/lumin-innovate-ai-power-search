import { Text, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import GoogleLg from 'assets/reskin/lumin-svgs/google-lg.svg';

import actions from 'actions';
import selectors from 'selectors';

import GoogleButton from 'lumin-components/GoogleButton';
import Loading from 'lumin-components/Loading';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useTranslation } from 'hooks/useTranslation';

import { organizationServices, userServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, orgUtil, toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ErrorCode } from 'constants/errorCode';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { ERROR_MESSAGE_ORG } from 'constants/messages';
import { CONTACT_LIST_CONNECT, DOMAIN_VISIBILITY_SETTING, ORG_SET_UP_TYPE } from 'constants/organizationConstants';

import AddCollaborators from './components/AddCollaborators';
import Finish from './components/Finish';
import { useHandleConnectGoogle } from './useHandleConnectGoogle';

import * as Styled from './FindColleaguesForOrganization.styled';

import styles from './FindColleaguesForOrganization.module.scss';

export const STEP = {
  FIND_COLLABORATORS: 'FIND_COLLABORATORS',
  ADD_COLLABORATORS: 'ADD_COLLABORATORS',
  FINISH: 'FINISH',
};

const STEP_FINISH_DATA = {
  orgName: '',
  orgUrl: '',
};

const FindColleaguesForOrganization = ({
  createdOrg,
  createOrgData,
  setCurrentStep,
  purpose,
  setIsDisableBackButton,
  isReskin,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [finishStepData, setFinishStepData] = useState(STEP_FINISH_DATA);
  const [step, setStep] = useState(STEP.FIND_COLLABORATORS);
  const [type, setType] = useState(CONTACT_LIST_CONNECT.NOT_CONNECT);
  const { accessToken, googleMail, handleConnect } = useHandleConnectGoogle({ setStep, setType });
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const { isPopularDomain } = useGetCurrentUser();

  const onAddMembersToExistedOrg = async (members) => {
    try {
      if (members.length) {
        await organizationServices.inviteMemberToOrg({
          orgId: createdOrg._id,
          members,
        });
      }

      return createdOrg;
    } catch (err) {
      const { code } = errorUtils.extractGqlError(err);
      if (code === ErrorCode.Org.ACTION_BLOCKED_BY_SCIM) {
        toastUtils.error({ message: ERROR_MESSAGE_ORG.ACTION_BLOCKED_BY_SCIM }).finally(() => {});
      } else {
        throw err;
      }
    }
  };

  const onCreateNewOrg = async (members) => {
    let domainVisibility = createOrgData.visibility
      ? DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE
      : DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE;
    if (isPopularDomain) {
      domainVisibility = DOMAIN_VISIBILITY_SETTING.INVITE_ONLY;
    }
    const { organization } = await organizationServices.createOrganization({
      organizationData: {
        name: createOrgData.orgName,
        settings: {
          domainVisibility,
        },
        members,
        purpose,
      },
    });
    userServices.saveHubspotProperties({
      key: HUBSPOT_CONTACT_PROPERTIES.COMPLETE_NEW_AUTHEN_ORGANIZATION_FLOW,
      value: 'true',
    });
    const organizationWithRole = orgUtil.mappingOrgWithRoleAndTeams(organization);
    dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
    dispatch(actions.setOrganizations([...organizationList, organizationWithRole]));

    return organization;
  };

  const handleFinish = async ({ members, handler }) => {
    setIsLoading(true);
    setIsDisableBackButton(true);
    try {
      const organization = await handler(members);
      const { name: orgName, url: orgUrl } = organization;

      unstable_batchedUpdates(() => {
        setStep(STEP.FINISH);
        setFinishStepData({
          orgName,
          orgUrl,
        });
        setCurrentStep(STEP.FINISH);
      });
    } catch (error) {
      const { message } = errorUtils.extractGqlError(error);
      logger.logError({ message, error });
    } finally {
      setIsLoading(false);
      setIsDisableBackButton(false);
    }
  };

  const beforeFinish = ({ members }) => {
    if (!createdOrg) {
      handleFinish({ members, handler: onCreateNewOrg });
      return;
    }

    handleFinish({ members, handler: onAddMembersToExistedOrg });
  };

  const onClick = (_type) => {
    setStep(STEP.ADD_COLLABORATORS);
    setType(_type);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading useReskinCircularProgress={isReskin} normal />;
    }

    if (step === STEP.FINISH) {
      return <Finish orgName={finishStepData.orgName} orgUrl={finishStepData.orgUrl} />;
    }

    if (step === STEP.ADD_COLLABORATORS) {
      return (
        <AddCollaborators
          type={type}
          accessToken={accessToken}
          onSubmit={beforeFinish}
          isSubmitting={isLoading}
          googleMail={googleMail}
        />
      );
    }

    if (isReskin) {
      return (
        <>
          <div className={styles.content}>
            <Text type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
              {t('setUpOrg.titleFindColleagues')}
            </Text>
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('setUpOrg.descriptionFindColleagues')}
            </Text>
          </div>
          <div className={styles.actions}>
            <Button
              size="lg"
              variant="outlined"
              onClick={() => onClick(CONTACT_LIST_CONNECT.NOT_CONNECT)}
              data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_CONNECT_DONT_GOOGLE_ACCOUNT}
            >
              {t('common.skip')}
            </Button>
            <Button
              size="lg"
              variant="filled"
              startIcon={<img src={GoogleLg} alt="Google" />}
              onClick={handleConnect}
              data-lumin-btn-name={ButtonName.ONBOARDING_CREATE_NEW_CIRCLE_CONNECT_GOOGLE_ACCOUNT}
            >
              {t('setUpOrg.connectWith', { target: 'Google' })}
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <Styled.Title>{t('setUpOrg.titleFindColleagues')}</Styled.Title>
        <Styled.Description>{t('setUpOrg.descriptionFindColleagues')}</Styled.Description>
        <Styled.ButtonWrapper>
          <div>
            <GoogleButton
              onClick={handleConnect}
              data-lumin-btn-name={ButtonName.ONBOARDING_CREATE_NEW_CIRCLE_CONNECT_GOOGLE_ACCOUNT}
            />
          </div>
          <Styled.Link
            onClick={() => onClick(CONTACT_LIST_CONNECT.NOT_CONNECT)}
            data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_CONNECT_DONT_GOOGLE_ACCOUNT}
          >
            {t('common.skip')}
          </Styled.Link>
        </Styled.ButtonWrapper>
      </>
    );
  };

  return isReskin ? renderContent() : <Styled.Container>{renderContent()}</Styled.Container>;
};

FindColleaguesForOrganization.propTypes = {
  createOrgData: PropTypes.object,
  createdOrg: PropTypes.object,
  setCurrentStep: PropTypes.func.isRequired,
  purpose: PropTypes.oneOf(Object.values(ORG_SET_UP_TYPE)),
  setIsDisableBackButton: PropTypes.func,
  isReskin: PropTypes.bool,
};

FindColleaguesForOrganization.defaultProps = {
  createdOrg: null,
  createOrgData: {},
  purpose: ORG_SET_UP_TYPE.PERSONAL,
  setIsDisableBackButton: () => {},
  isReskin: false,
};

export default FindColleaguesForOrganization;
