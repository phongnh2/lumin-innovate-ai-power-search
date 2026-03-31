import { yupResolver } from '@hookform/resolvers/yup';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import selectors from 'selectors';

import FindColleaguesForOrganization from 'lumin-components/FindColleaguesForOrganization';
import { LayoutSecondary } from 'lumin-components/Layout';
import SetUpOrganizationForm from 'lumin-components/SetUpOrganizationForm';
import StepSetUpOrganization from 'lumin-components/StepSetUpOrganization';

import { useEnableWebReskin } from 'hooks';

import Yup, { yupValidator } from 'utils/yup';

import { MAX_ORGANIZATION_NAME_LENGTH, ORG_SET_UP_TYPE } from 'constants/organizationConstants';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import * as Styled from './SetUpOrganization.styled';

import styles from './SetUpOrganization.module.scss';

const CURRENT_STEP = {
  SET_UP_ORGANIZATION: 'SET_UP_ORGANIZATION',
  FIND_COLLABORATORS: 'FIND_COLLABORATORS',
  FINISH: 'FINISH',
};

const CURRENT_STEP_ORGANIZATION = {
  [CURRENT_STEP.SET_UP_ORGANIZATION]: 1,
  [CURRENT_STEP.FIND_COLLABORATORS]: 2,
  [CURRENT_STEP.FINISH]: 3,
};

const SetUpOrganization = ({ title }) => {
  const navigate = useNavigate();
  const { state, search } = useLocation();

  const { createdOrg, fromPayment } = state || {};
  const createdOrgRef = useRef(createdOrg);

  const [currentStep, setCurrentStep] = useState(
    fromPayment ? CURRENT_STEP.FIND_COLLABORATORS : CURRENT_STEP.SET_UP_ORGANIZATION
  );
  const [createOrgData, setCreateOrgData] = useState({});
  const [purpose, setPurpose] = useState(fromPayment ? ORG_SET_UP_TYPE.WORK : '');
  const { email } = useSelector(selectors.getCurrentUser, shallowEqual);
  const suggestedOrganizations = useSelector(selectors.getSuggestedOrganizations, shallowEqual).data || [];
  const hasBackButton =
    (currentStep === CURRENT_STEP.SET_UP_ORGANIZATION && suggestedOrganizations.length > 0) ||
    (currentStep === CURRENT_STEP.FIND_COLLABORATORS && !fromPayment);
  const [isDisableBackButton, setIsDisableBackButton] = useState(false);
  const { isPopularDomain } = useSelector(selectors.getCurrentUser, shallowEqual);

  const { isEnableReskin } = useEnableWebReskin();

  const getDefaultOrgName = () => {
    const [username, domain] = email.split('@');
    return `${capitalize(isPopularDomain ? username : domain.split('.')[0]).slice(0, MAX_ORGANIZATION_NAME_LENGTH)}`;
  };

  const schema = useMemo(
    () =>
      Yup.object().shape({
        orgName: yupValidator().organizationName,
      }),
    []
  );

  const { control, handleSubmit, formState, setValue, trigger } = useForm({
    mode: 'onChange',
    defaultValues: {
      orgName: getDefaultOrgName(),
      visibility: !isPopularDomain,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trigger('orgName');
  }, []);

  useEffect(() => {
    if (state) {
      window.history.replaceState(null, '');
    }
  }, [navigate, state]);

  const handleBackButton = () => {
    if (currentStep === CURRENT_STEP.SET_UP_ORGANIZATION) {
      navigate(`${NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION}${search}`);
      return;
    }

    setCurrentStep(CURRENT_STEP.SET_UP_ORGANIZATION);
  };

  const renderContent = () => {
    if (currentStep !== CURRENT_STEP.SET_UP_ORGANIZATION) {
      return (
        <FindColleaguesForOrganization
          createdOrg={createdOrgRef.current}
          createOrgData={createOrgData}
          setCurrentStep={setCurrentStep}
          purpose={purpose}
          setIsDisableBackButton={setIsDisableBackButton}
          isReskin={isEnableReskin}
        />
      );
    }

    return (
      <SetUpOrganizationForm
        title={title}
        setCreateOrgData={setCreateOrgData}
        setCurrentStep={setCurrentStep}
        purpose={purpose}
        setPurpose={setPurpose}
        control={control}
        handleSubmit={handleSubmit}
        formState={formState}
        setIsDisableBackButton={setIsDisableBackButton}
        setValue={setValue}
        isReskin={isEnableReskin}
      />
    );
  };

  return (
    <LayoutSecondary
      footer={false}
      canClickLogo={false}
      hasBackButton={hasBackButton}
      onClickBackButton={handleBackButton}
      disabledBackButton={isDisableBackButton}
      isReskin={isEnableReskin}
      backgroundColor={isEnableReskin ? 'var(--kiwi-colors-surface-surface-container-low)' : 'transparent'}
    >
      {isEnableReskin ? (
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <div className={styles.stepWrapper}>
              <StepSetUpOrganization step={CURRENT_STEP_ORGANIZATION[currentStep]} />
            </div>
            {renderContent()}
          </div>
        </div>
      ) : (
        <Styled.Wrapper>
          <Styled.Container>
            <Styled.StepWrapper>
              <StepSetUpOrganization step={CURRENT_STEP_ORGANIZATION[currentStep]} />
            </Styled.StepWrapper>
            <Styled.Content>{renderContent()}</Styled.Content>
          </Styled.Container>
        </Styled.Wrapper>
      )}
    </LayoutSecondary>
  );
};

SetUpOrganization.propTypes = {
  title: PropTypes.string.isRequired,
};

SetUpOrganization.defaultProps = {};

export default SetUpOrganization;
