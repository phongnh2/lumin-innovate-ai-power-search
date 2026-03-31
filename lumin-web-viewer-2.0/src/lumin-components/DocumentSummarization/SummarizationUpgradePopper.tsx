import { get } from 'lodash';
import { Button } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Popper from '@new-ui/general-components/Popper';

import selectors from 'selectors';

import SvgElement from 'luminComponents/SvgElement';

import { useTrackingModalEvent } from 'hooks';
import { useGetRemoveButtonProStartTrial } from 'hooks/growthBook/useGetRemoveButtonProStartTrial';
import useShallowSelector from 'hooks/useShallowSelector';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import { getPaymentUrl } from 'helpers/getPaymentUrl';

import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';

import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

import * as Styled from './DocumentSummarization.styled';

interface ISummarizationUpgradePopper {
  openPopper: boolean;
  anchorRef: HTMLElement;
  onClosePopper: () => void;
}

const SummarizationUpgradePopper = (props: ISummarizationUpgradePopper) => {
  const { openPopper, anchorRef, onClosePopper } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: `${PremiumToolsPopOverEvent.SummarizeDocument}PopOver`,
    modalPurpose: 'Premium tool pop-over',
  });
  const { isRemoveButtonProStartTrial } = useGetRemoveButtonProStartTrial();

  const payment = get(currentDocument, 'documentReference.data.payment', {}) as IOrganizationPayment;

  const handleNavigation = ({
    trackEventCallback,
    isStartTrial,
  }: {
    trackEventCallback: () => void;
    isStartTrial?: boolean;
  }) => {
    trackEventCallback();
    const orgId = getOrgIdOfDoc({ currentDocument });
    const url = getPaymentUrl({ currentDocument, orgId, isStartTrial });
    navigate(url);
  };

  useEffect(() => {
    if (openPopper) {
      trackModalViewed().catch(() => {});
    }
  }, [openPopper]);

  return (
    <Popper
      open={openPopper}
      onClose={onClosePopper}
      placement="bottom"
      anchorEl={anchorRef}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
      ]}
      paperProps={{
        rounded: 'large',
      }}
    >
      <Styled.SummarizePopper>
        <Styled.PopperSvg>
          <SvgElement content="icon-three-stars" width={48} height={48} />
        </Styled.PopperSvg>
        <Styled.PopperTitle>{t('viewer.upgradeToAccess')}</Styled.PopperTitle>
        <Styled.PopperDesc>{t('viewer.levelUpToUnlock')}</Styled.PopperDesc>
        <Styled.PopperButtons>
          {payment?.trialInfo?.canUseProTrial && (
            <Button
              variant={!isRemoveButtonProStartTrial ? 'outlined' : 'filled'}
              size="lg"
              fullWidth
              onClick={() => handleNavigation({ trackEventCallback: trackModalDismiss, isStartTrial: true })}
            >
              {t('common.startFreeTrial')}
            </Button>
          )}
          {!isRemoveButtonProStartTrial && (
            <Button
              variant="filled"
              size="lg"
              fullWidth
              onClick={() => handleNavigation({ trackEventCallback: trackModalConfirmation })}
            >
              {t('common.goPro')}
            </Button>
          )}
        </Styled.PopperButtons>
      </Styled.SummarizePopper>
    </Popper>
  );
};

export default SummarizationUpgradePopper;
