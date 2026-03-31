import { Button, ButtonSize, ButtonVariant, Divider } from 'lumin-ui/kiwi-ui';
import React, { Fragment, MouseEvent, useCallback, useContext, useEffect, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import AppExtensionImage from 'assets/reskin/lumin-svgs/app-extension.svg';
import PromotingAppExtensionImage from 'assets/reskin/lumin-svgs/promoting-app-extension.svg';

import selectors from 'selectors';

import { RouterContext } from 'navigation/Router/RouterContext';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { isChrome } from 'helpers/device';
import isMobileOrTablet from 'helpers/isMobileOrTablet';

import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import BaseCancellationPage from 'features/CNC/CncComponents/BaseCancellationPage';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { PromptToDownloadTracker } from 'features/CNC/helpers/getCancellationTracker';
import { useCheckHasInstalledExtension } from 'features/CNC/hooks';
import { usePromptToDownloadAfterCancellation } from 'features/CNC/hooks/usePromptToDownloadAfterCancellation';

import { Routers } from 'constants/Routers';
import { CHROME_EXTENSION_URL } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useGetFinishCancelSubContent from './hooks/useGetFinishCancelSubContent';

import styles from './FinishCancelSubscription.module.scss';

interface DownloadOptionProps {
  titleKey: string;
  descriptionKey: string;
  illustrationImg: string;
  cta: {
    textKey: string;
    name?: typeof CNCButtonName[keyof typeof CNCButtonName];
    purpose?: typeof CNCButtonPurpose[keyof typeof CNCButtonPurpose];
    handleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  };
}

const desktopAppOption: DownloadOptionProps = {
  titleKey: 'finishCancelSubscription.desktopAppOption.title',
  descriptionKey: 'finishCancelSubscription.desktopAppOption.description',
  illustrationImg: PromotingAppExtensionImage,
  cta: {
    textKey: 'finishCancelSubscription.desktopAppOption.cta',
    handleClick: () => {
      PromptToDownloadTracker.updateTracker('app', {
        hasViewedDownloadAppPage: {
          status: true,
          time: Date.now(),
        },
      });
      window.open(Routers.DOWNLOAD, '_blank', 'noopener noreferrer');
    },
  },
};
const chromeExtensionOption: DownloadOptionProps = {
  titleKey: 'finishCancelSubscription.chromeExtensionOption.title',
  descriptionKey: 'finishCancelSubscription.chromeExtensionOption.description',
  illustrationImg: AppExtensionImage,
  cta: {
    textKey: 'finishCancelSubscription.chromeExtensionOption.cta',
    handleClick: () => {
      PromptToDownloadTracker.updateTracker('extension', {
        hasViewedDownloadExtensionPage: {
          status: true,
          time: Date.now(),
        },
      });
      window.open(CHROME_EXTENSION_URL, '_blank', 'noopener noreferrer');
    },
  },
};

const DownloadOption = ({
  titleKey,
  descriptionKey,
  illustrationImg,
  cta: { textKey, handleClick },
}: DownloadOptionProps) => {
  const { t } = useTranslation();

  return (
    <div key={titleKey} className={styles.downloadOption}>
      <div className={styles.illustrationImgWrapper}>
        <img src={illustrationImg} alt={t(titleKey)} />
      </div>
      <div className={styles.contentWrapper}>
        <p className={styles.downloadOptionTitle}>{t(titleKey)}</p>
        <p className={styles.downloadOptionDescription}>{t(descriptionKey)}</p>
        <Button variant={ButtonVariant.filled} size={ButtonSize.lg} className={styles.ctaBtn} onClick={handleClick}>
          {t(textKey)}
        </Button>
      </div>
    </div>
  );
};

const FinishCancelSubscription = () => {
  const navigate = useNavigate();
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const { title, description } = useGetFinishCancelSubContent();
  const { t } = useTranslation();
  const backToHomepage = () => {
    const url = getDefaultOrgUrl({ orgUrl: currentOrganization.url });
    navigate(url, { replace: true });
  };

  const { shouldPromptToDownload } = usePromptToDownloadAfterCancellation();
  const { hasInstalledPwa = false } = useContext(RouterContext) as { hasInstalledPwa: boolean };
  const { hasInstalledExtension } = useCheckHasInstalledExtension({
    onSuccess: useCallback(() => {
      if (shouldPromptToDownload) {
        PromptToDownloadTracker.registerTracker('extension');
      }
    }, [shouldPromptToDownload]),
  });
  const hasBothInstalled = hasInstalledPwa && hasInstalledExtension;

  const downloadOptions = useMemo(() => {
    if (!isChrome || hasBothInstalled || isMobileOrTablet()) return [];

    if (hasInstalledPwa) return [chromeExtensionOption];

    if (hasInstalledExtension) return [desktopAppOption];

    return [desktopAppOption, chromeExtensionOption];
  }, [hasBothInstalled, hasInstalledExtension, hasInstalledPwa]);

  useEffect(() => {
    if (shouldPromptToDownload && !hasInstalledPwa) {
      PromptToDownloadTracker.registerTracker('app');
    }
  }, [shouldPromptToDownload, hasInstalledPwa]);

  return (
    <BaseCancellationPage>
      <div className={styles.container}>
        <div className={styles.paper}>
          <div className={styles.iconWrapper}>
            <Icomoon className="success" color="var(--kiwi-colors-semantic-success)" size={48} />
          </div>
          <div>
            <div className={styles.title}>{title}</div>
            <div className={styles.description}>{description}</div>
          </div>
          {shouldPromptToDownload && downloadOptions.length !== 0 ? (
            <>
              <Divider className={styles.divider} />
              <section className={styles.promptToDownload}>
                <div className={styles.title}>{t('finishCancelSubscription.promptDownloadTitle')}</div>
                <div className={styles.container}>
                  {downloadOptions.map((option, index) => (
                    <Fragment key={option.titleKey}>
                      {index !== 0 ? <Divider className={styles.divider} /> : null}
                      <DownloadOption {...option} />
                    </Fragment>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className={styles.buttonWrapper}>
              <Button
                variant={ButtonVariant.filled}
                size={ButtonSize.lg}
                data-lumin-btn-name={CNCButtonName.FINISH_CANCEL_SUBSCRIPTION}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.FINISH_CANCEL_SUBSCRIPTION]}
                onClick={backToHomepage}
              >
                {t('finishCancelSubscription.goToHomePage')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </BaseCancellationPage>
  );
};

export default FinishCancelSubscription;
