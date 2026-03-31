import React from 'react';
import { Trans } from 'react-i18next';

import selectors from 'selectors';

import useGetCurrentUser from 'hooks/useGetCurrentUser';
import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { signature } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';
import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './YourSignatures.styled';

const Header = () => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const renderLimitSignMessage = (maximumNumberSignature = MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN) => {
    const signaturesQuanity = signature.getNumberOfSignatures(currentUser);
    const isFreePlanUser = maximumNumberSignature === MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;
    const shouldShowMessage = signaturesQuanity >= maximumNumberSignature || isFreePlanUser;
    // NOTE: update later on
    if (!shouldShowMessage) {
      return null;
    }

    return (
      <Styled.Desc>
        {t('viewer.signatureOverlay.limitSignMessage', {
          numberSign: signaturesQuanity,
          maxNumberSign: maximumNumberSignature,
        })}
      </Styled.Desc>
    );
  };

  const renderUpgradePlanMessage = (maximumNumberSignature) => {
    const signaturesQuanity = signature.getNumberOfSignatures(currentUser);

    if (signaturesQuanity >= maximumNumberSignature && maximumNumberSignature === MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN) {
      return (
        <Styled.Desc>
          <Trans i18nKey="viewer.signatureOverlay.pleaseUpgradeToAddMore">
            <span>To add more, please </span>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <Styled.NavigateBtn
              className="upgrade-message"
              onClick={() => window.open(`${STATIC_PAGE_URL}/pricing`, '_blank')}
              data-lumin-btn-name={ButtonName.SIGNATURE_TOOL_START_UPGRADE}
              data-lumin-btn-purpose={ButtonPurpose[ButtonName.SIGNATURE_TOOL_START_UPGRADE]}
            >
              Upgrade Your Plan
            </Styled.NavigateBtn>
          </Trans>
        </Styled.Desc>
      );
    }
    return null;
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <Styled.Wrapper>
      <Styled.Title>{t('viewer.signatureOverlay.yourSignatures')}</Styled.Title>
      {!!currentUser && renderLimitSignMessage(currentDocument.premiumToolsInfo?.maximumNumberSignature)}
      {!!currentUser && renderUpgradePlanMessage(currentDocument.premiumToolsInfo?.maximumNumberSignature)}
    </Styled.Wrapper>
  );
};

export default Header;
