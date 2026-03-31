import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import TimeLimitImageDark from 'assets/images/dark-document-rate-limit.svg';
import TimeLimitImage from 'assets/images/document-rate-limit.svg';

import selectors from 'selectors';

import AppCircularLoading from 'luminComponents/AppCircularLoading';
import useGetParentListUrl from 'luminComponents/HeaderLumin/hooks/useGetParentListUrl';
import { LayoutSecondary } from 'luminComponents/Layout';

import { useGetImageByTheme, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { PaymentUrlSerializer } from 'utils/payment';

import { ButtonBadRequestPage, BadRequestPageType } from 'constants/badRequestPage';
import { PERIOD, PLAN_TYPE } from 'constants/plan';

import './TimeLimit.scss';
import withLocationId from './HOC/withLocationId';

const propTypes = {
  currentDocument: PropTypes.object.isRequired,
  isOffline: PropTypes.bool.isRequired,
  locationId: PropTypes.string,
};

const defaultProps = {
  locationId: '',
};

const getRoleAndMessage = ({ organizations, currentDocument, t }) => {
  const orgOwnCurrentDoc = getOrgOfDoc({ organizations, currentDocument });
  if (organizationServices.isManager(orgOwnCurrentDoc?.userRole)) {
    return {
      isManager: true,
      message: t('viewer.timeLimit.upgradeToAccessOldDocuments'),
    };
  }
  if (currentDocument.isShared) {
    return {
      isManager: false,
      message: t('viewer.timeLimit.requestDocOwnerUpgradePlan'),
    };
  }
  return {
    isManager: false,
    message: t('viewer.timeLimit.requestOrgAdminUpgradePlan'),
  };
};

const TimeLimit = ({ currentDocument, isOffline, locationId }) => {
  const { t } = useTranslation();
  const timeLimitImage = useGetImageByTheme(TimeLimitImage, TimeLimitImageDark);
  const navigate = useNavigate();
  const backUrl = useGetParentListUrl();

  const { organization } = useSelector((state) => selectors.getOrganizationById(state, locationId), shallowEqual) || {};
  const { organization: orgFromTeam } =
    useSelector((state) => selectors.getOrganizationFromTeam(state, locationId), shallowEqual) || {};

  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);

  if (organizations.loading) {
    return <AppCircularLoading />;
  }

  const { isManager, message } = getRoleAndMessage({ organizations, currentDocument, t });
  const getPaymentRedirectUrl = () => {
    const org = organization || orgFromTeam;
    const { _id } = org;
    const urlSerializer = new PaymentUrlSerializer()
      .trial(false)
      .of(_id)
      .period(PERIOD.ANNUAL)
      .plan(PLAN_TYPE.ORG_PRO)
      .returnUrlParam();
    return urlSerializer.get();
  };

  const renderFooterButtons = () => (
    <>
      <Button
        {...(isManager ? { ...ButtonBadRequestPage.TextLargeSystem } : { ...ButtonBadRequestPage.FilledLargeSystem })}
        onClick={() => navigate(backUrl)}
        className={!isOffline && isManager ? 'flex-start' : ''}
      >
        {t('viewer.timeLimit.backBtn')}
      </Button>
      {!isOffline && isManager && (
        <Button component={Link} {...ButtonBadRequestPage.FilledLargeSystem} to={getPaymentRedirectUrl()}>
          {t('viewer.timeLimit.upgradeBtn')}
        </Button>
      )}
    </>
  );

  const renderDescription = () => (
    <>
      <p>{t('viewer.timeLimit.content')}</p>
      <p>{message}</p>
    </>
  );

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout>
      <BadRequestPage
        id={BadRequestPageType.RateLimit}
        title={t('viewer.timeLimit.title')}
        image={timeLimitImage}
        description={renderDescription()}
        buttons={renderFooterButtons()}
        flexEnd={!(!isOffline && isManager)}
      />
    </LayoutSecondary>
  );
};

TimeLimit.propTypes = propTypes;
TimeLimit.defaultProps = defaultProps;

export default withLocationId(TimeLimit);
