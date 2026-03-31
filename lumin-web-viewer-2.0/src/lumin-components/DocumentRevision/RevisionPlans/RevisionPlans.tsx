/* eslint-disable @typescript-eslint/no-floating-promises */
import { get } from 'lodash';
import { Button } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import VersionHistoryPlanImage from 'assets/images/drive_revision.svg';

import { organizationServices } from 'services';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import { getPaymentUrl } from 'helpers/getPaymentUrl';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { DescriptionContext, GOOGLE_DRIVE_VERSIONING_POLICY } from 'features/DocumentRevision/constants';

import { DocumentService } from 'constants/document.enum';
import { Plans } from 'constants/plan';

import { IDocumentBase } from 'interfaces/document/document.interface';

import * as Styled from './RevisionPlans.styled';

type IRevisionPlansPlans = {
  currentDocument: IDocumentBase;
  canUseEnhancedFeatures: boolean;
};

const googleStorageLearnMoreUrl = 'https://help.luminpdf.com/restore-version-history-lumin-google';
const luminStorageLearnMoreUrl = 'https://help.luminpdf.com/restore-version-history-lumin-storage';

const RevisionPlans = (props: IRevisionPlansPlans) => {
  const { currentDocument, canUseEnhancedFeatures } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const trackingData = {
    modalName: ModalName.VERSION_HISTORY_UPGRADE,
    modalPurpose: ModalPurpose[ModalName.VERSION_HISTORY_UPGRADE],
  };

  const orgId = getOrgIdOfDoc({ currentDocument });
  const paymentUrl = getPaymentUrl({ currentDocument, orgId });
  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');

  const isAdmin = organizationServices.isManager(get(currentDocument, 'documentReference.data.userRole', ''));
  const isGoogleDriveDocument = currentDocument?.service === DocumentService.google;
  const descriptionPrefix = 'viewer.revision.upgrade.description';
  const learnMoreUrl = isGoogleDriveDocument ? googleStorageLearnMoreUrl : luminStorageLearnMoreUrl;

  const getDescriptionContext = () => {
    if (canUseEnhancedFeatures) {
      return DescriptionContext.SUPER;
    }

    if (isAdmin) {
      return DescriptionContext.ADMIN;
    }

    return DescriptionContext.MEMBER;
  };

  const descriptionContext = getDescriptionContext();

  const getVersioningInfo = () => {
    const DEFAULT_POLICY = {} as IDocumentBase['premiumToolsInfo']['documentVersioning'];
    if (isGoogleDriveDocument) {
      return GOOGLE_DRIVE_VERSIONING_POLICY[descriptionContext] || DEFAULT_POLICY;
    }

    return get(currentDocument, 'premiumToolsInfo.documentVersioning', DEFAULT_POLICY);
  };

  const getDescriptionByPlan = () => {
    const { maximumSaveTimeUnit, maximumSaveTime, quantity } = getVersioningInfo();
    const timeUnit = maximumSaveTimeUnit ? t(`viewer.revision.timeUnit.${maximumSaveTimeUnit}`) : '';
    return (
      <Trans
        i18nKey={descriptionPrefix}
        values={{ context: descriptionContext, maximumSaveTime, maximumSaveTimeUnit: timeUnit, quantity }}
        components={{ b: <b /> }}
      />
    );
  };

  const renderPlanDesc = () => (
    <>
      <Trans i18nKey={descriptionPrefix} components={{ b: <b /> }} /> {getDescriptionByPlan()}
      <Styled.LearnMore target="_blank" href={learnMoreUrl}>
        {t('common.learnMore')}
      </Styled.LearnMore>
    </>
  );

  useEffect(() => {
    if (!canUseEnhancedFeatures) {
      modalEvent.modalViewed(trackingData);
    }
  }, []);

  return (
    <Styled.PlanWrapper>
      <Styled.PlanImage src={VersionHistoryPlanImage} />
      {!canUseEnhancedFeatures && <Styled.PlanTitle>{t('viewer.revision.upgrade.title')}</Styled.PlanTitle>}
      <Styled.PlanDesc>{renderPlanDesc()}</Styled.PlanDesc>
      {isAdmin && !canUseEnhancedFeatures && (currentPlan !== Plans.ENTERPRISE || isGoogleDriveDocument) ? (
        <Button
          size="md"
          variant="filled"
          onClick={() => {
            modalEvent.modalConfirmation(trackingData);
            navigate(paymentUrl);
          }}
        >
          {t('common.goPro')}
        </Button>
      ) : null}
    </Styled.PlanWrapper>
  );
};

export default RevisionPlans;
