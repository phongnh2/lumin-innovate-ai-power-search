import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import { LayoutSecondary } from 'luminComponents/Layout';

import { useTranslation } from 'hooks';

import { eventTracking } from 'utils';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import UserEventConstants from 'constants/eventConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

interface IProps {
  children: React.ReactElement;
}

const BaseCancellationPage = ({ children }: IProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const backToDocument = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: CNCButtonName.BACK_TO_HOME,
      elementPurpose: CNCButtonPurpose[CNCButtonName.BACK_TO_HOME],
    }).catch(() => {});
    const url = getDefaultOrgUrl({ orgUrl: currentOrganization.url });
    navigate(url, { replace: true });
  };

  return (
    <LayoutSecondary
      footer={false}
      hasBackButton
      hasLogo={false}
      onClickBackButton={backToDocument}
      backButtonText={t('common.backToHome')}
      isReskin
      cancellationPage
    >
      {children}
    </LayoutSecondary>
  );
};

export default BaseCancellationPage;
