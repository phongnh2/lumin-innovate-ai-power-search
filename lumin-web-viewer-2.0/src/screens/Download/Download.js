import React, { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { PromptToDownloadTracker } from 'src/features/CNC/helpers/getCancellationTracker';
import { RouterContext } from 'src/navigation/Router/RouterContext';

import EvenFaster from 'assets/images/even-faster.png';
import IconChrome from 'assets/images/google-chrome-icon.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetMetaTitle, useTranslation } from 'hooks';

import { userServices } from 'services';

import { isChrome, isWindow10 } from 'helpers/device';
import isMobileOrTablet from 'helpers/isMobileOrTablet';
import logger from 'helpers/logger';

import appEvent from 'utils/Factory/EventCollection/AppEventCollection';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { CNC_LOCAL_STORAGE_KEY, PROMPTS_TO_DOWNLOAD_APP_ORDER } from 'features/CNC/constants/customConstant';

import UserEventConstants from 'constants/eventConstants';
import { APP_DOWNLOAD, LOGGER } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';

import useCheckingPwaStatus from './hooks/useCheckingPwaStatus';
import { eventTracking } from '../../utils';

import * as Styled from './Download.styled';

Download.propTypes = {};

function Download() {
  const { hasInstalledPwa, installPwa } = useContext(RouterContext);
  const { checking } = useCheckingPwaStatus();
  const { t } = useTranslation();
  const { getMetaTitle } = useGetMetaTitle();

  const installPwaOrOpenMsStore = () => {
    PromptToDownloadTracker.updateTracker('app', {
      hasDownloadedApp: {
        status: true,
        time: Date.now(),
      },
    });
    if (isWindow10()) {
      window.open(APP_DOWNLOAD.MS_STORE);
      return;
    }
    installPwa();
  };

  const onButtonClick = () => {
    try {
      appEvent.downloadPWA();
      userServices.trackDownloadClickedEvent();
    } catch (err) {
      logger.logError({ error: err, reason: LOGGER.Service.APP_DOWNLOAD });
    } finally {
      installPwaOrOpenMsStore();
    }
  };

  const title = isChrome ? (
    <Styled.Title>{t('download.installTheLuminDesktopApp')}</Styled.Title>
  ) : (
    <Styled.Title>
      {t('download.getLuminOnChrome')} <Styled.IconChrome src={IconChrome} alt="Google Chrome" />
    </Styled.Title>
  );

  useEffect(() => {
    PromptToDownloadTracker.updateTracker('app', {
      hasOpenApp: {
        status: !!(hasInstalledPwa && !checking),
        time: hasInstalledPwa && !checking ? Date.now() : null,
      },
    });
    try {
      const cancellationPromptToDownloadAppCycle = JSON.parse(
        localStorage.getItem(CNC_LOCAL_STORAGE_KEY.PROMPT_TO_DOWNLOAD_APP_CYCLE)
      );
      const hasUserCompletedCycle = Object.values(cancellationPromptToDownloadAppCycle).every(
        (prompt) => prompt.status
      );
      const hasUserCompletedCycleInOrder = PROMPTS_TO_DOWNLOAD_APP_ORDER.every((step, index, arr) => {
        if (index === 0) {
          return true;
        }

        const prevStepCompletedTimestamp = cancellationPromptToDownloadAppCycle[arr[index - 1]].time;
        const currentStepCompletedTimestamp = cancellationPromptToDownloadAppCycle[arr[index]].time;

        if (prevStepCompletedTimestamp === null || currentStepCompletedTimestamp === null) {
          return false;
        }
        return prevStepCompletedTimestamp < currentStepCompletedTimestamp;
      });

      if (hasUserCompletedCycle && hasUserCompletedCycleInOrder) {
        eventTracking(
          UserEventConstants.EventType.USER_COMPLETED_CANCELLATION_PROMPT_CYCLE,
          {
            cycleType: 'app',
          },
          {}
        ).then(() => {
          PromptToDownloadTracker.removeTracker('app');
        });
      }
    } catch (err) {
      logger.logError({ message: 'Failed to parse localStorage data', error: err });
    }
  }, [hasInstalledPwa, checking]);

  const visitText = (
    <Trans i18nKey="download.visitText">
      Visit <Link to={Routers.DOWNLOAD}>app.luminpdf.com/download</Link>
      on your Chrome browser from your desktop to download.
    </Trans>
  );
  const subTitle = isChrome ? (
    <Styled.SubTitle>{t('download.getToWorkEvenFaster')}</Styled.SubTitle>
  ) : (
    <Styled.SubTitle>{t('download.desktopApp')}</Styled.SubTitle>
  );
  const renderDescription = () => {
    if (isMobileOrTablet()) {
      return <Styled.Text>{visitText}</Styled.Text>;
    }
    return isChrome ? (
      <Styled.Text>{t('download.chromeDescription')}</Styled.Text>
    ) : (
      <Styled.Text>
        {t('download.notChromeDescription')}
        <br />
        {visitText}
      </Styled.Text>
    );
  };

  return (
    <Styled.Wrapper>
      <Helmet>
        <title>{getMetaTitle(t('download.downloadLuminApp'))}</title>
      </Helmet>
      <LayoutSecondary>
        <Styled.Container>
          <Styled.TextContainer>
            <Styled.PrimaryImageContainer>
              <Styled.PrimaryImage src={EvenFaster} alt="Even Faster" />
            </Styled.PrimaryImageContainer>
            <Styled.DescriptionContainer>
              {subTitle}
              {title}
              {renderDescription()}
              {isChrome && !checking && !isMobileOrTablet() && (
                <Styled.ButtonWrapper>
                  <Styled.ButtonInstall
                    onClick={onButtonClick}
                    disabled={hasInstalledPwa}
                    size={ButtonSize.XL}
                    data-lumin-btn-name={ButtonName.INSTALL_PWA_CTA_NOT_WINDOWS}
                  >
                    <Icomoon className="download-3" style={{ marginRight: 8 }} />{' '}
                    {hasInstalledPwa ? t('download.installed') : t('download.installNow')}
                  </Styled.ButtonInstall>
                </Styled.ButtonWrapper>
              )}
            </Styled.DescriptionContainer>
          </Styled.TextContainer>
        </Styled.Container>
      </LayoutSecondary>
    </Styled.Wrapper>
  );
}

export default Download;
