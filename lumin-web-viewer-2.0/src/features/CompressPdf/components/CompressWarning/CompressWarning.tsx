import React from 'react';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import SemanticWarning from 'luminComponents/SemanticWarning';

import { useGetCurrentOrganization, useTranslation } from 'hooks';
import useShallowSelector from 'hooks/useShallowSelector';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import { getPaymentUrl } from 'helpers/getPaymentUrl';

import { PaymentUrlSerializer } from 'utils/payment';

import { CompressLevelValidationType } from 'features/CompressPdf/types';

import WarningMessage from './WarningMessage';

const CompressWarning = (props: CompressLevelValidationType) => {
  const { isMember, canStartTrial, isFileSizeExceed, enableServerCompression } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentOrganization = useGetCurrentOrganization();

  const onClickStartFreeTrial = () => {
    const orgId = getOrgIdOfDoc({ currentDocument });
    const url = getPaymentUrl({ currentDocument, orgId, isStartTrial: true });
    navigate(url);
  };

  const onClickUpgrade = () => {
    const urlSerializer = new PaymentUrlSerializer();
    const paymentUrl = urlSerializer.of(currentOrganization?._id).returnUrlParam().pro;
    navigate(paymentUrl);
  };

  const getWarningContent = () => {
    if (enableServerCompression) {
      return <WarningMessage message={t('viewer.compressPdf.fileTooLarge')} />;
    }

    if (isMember) {
      return (
        <WarningMessage
          message={t('viewer.compressPdf.fileExceededSize')}
          additionalText={t('viewer.compressPdf.contactAdmin')}
        />
      );
    }

    const commonProps = {
      message: t('viewer.compressPdf.fileExceededSize'),
      additionalText: t('viewer.compressPdf.toCompressLargeFile'),
    };

    return (
      <WarningMessage
        {...commonProps}
        actionText={canStartTrial ? t('common.startFreeTrial') : t('common.upgrade')}
        actionClick={canStartTrial ? onClickStartFreeTrial : onClickUpgrade}
      />
    );
  };

  if (!isFileSizeExceed) {
    return null;
  }

  return <SemanticWarning content={getWarningContent()} />;
};

export default CompressWarning;
