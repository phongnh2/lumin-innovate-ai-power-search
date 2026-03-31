import { createRemoteAppComponent } from '@module-federation/bridge-react';
import classNames from 'classnames';
import { MenuProps } from 'lumin-ui/kiwi-ui';
import React, { forwardRef, useEffect, useId, useState } from 'react';
import { TFunction } from 'react-i18next';
import { useParams } from 'react-router';

import { useHomeContext } from 'screens/Home/hooks';

import { useTopFeaturesSectionContext } from 'luminComponents/TopFeaturesSection/hooks/useTopFeaturesSectionContext';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { loadRemote } from 'services/moduleFederation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import FeatureItem from '../FeatureItem';
import featureItemStyles from '../FeatureItem/FeatureItem.module.scss';

import styles from './GetSignatures.module.scss';

const isDisabledSignMf = process.env.DISABLE_SIGN_MF === 'true';

const ComponentTarget = forwardRef<
  HTMLDivElement,
  { t: TFunction; onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void }
>(({ t, onKeyDown, ...otherProps }, ref) => (
  <div
    ref={ref}
    {...otherProps}
    role="button"
    tabIndex={0}
    onKeyDown={onKeyDown}
    data-lumin-btn-name={ButtonName.HOME_GET_SIGNATURES}
    data-cy="home-get-signatures"
    className={featureItemStyles.container}
  >
    <i className={classNames('kiwi-icon-logo-sign-lg', featureItemStyles.icon)} />
    <p className={featureItemStyles.text}>{t('topFeaturesSection.getSignatures')}</p>
  </div>
));

const UploadButton =
  !isDisabledSignMf &&
  createRemoteAppComponent<UploadButtonProps>({
    loader: () => loadRemote('luminsign/UploadButton'),
    fallback: null,
    loading: null,
  });

const UploadContainer =
  !isDisabledSignMf &&
  createRemoteAppComponent<UploadContainerProps>({
    loader: () => loadRemote('luminsign/UploadContainer'),
    fallback: null,
    loading: null,
  });

type UploadButtonProps = {
  ComponentTarget: JSX.Element;
  className: string;
  menuContents: {
    labels: {
      Device: string;
      Google: string;
      Dropbox: string;
    };
    title: string;
  };
  opened: boolean;
  setOpened: (opened: boolean) => void;
  menuProps: MenuProps;
};

type UploadContainerProps = {
  orgName: string;
};

const GetSignatures = () => {
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const context = useTopFeaturesSectionContext();
  const popperId = useId();
  const { scrollRef } = useHomeContext();
  const { onKeyDown } = useKeyboardAccessibility();

  const uploadFromText = (from: string) => t('navbar.fromText', { text: from });

  useEffect(() => {
    context.registerPopper(popperId, () => setOpened(false));
    return () => {
      context.unregisterPopper(popperId);
    };
  }, [popperId, context]);

  return (
    <div className={styles.getSignaturesContainer}>
      <div className={styles.getSignatureWrapper}>
        {!isDisabledSignMf && (
          <UploadButton
            ComponentTarget={
              // NOTE: component much not has any hooks inside
              <ComponentTarget t={t} onKeyDown={onKeyDown} />
            }
            className={styles.uploadButton}
            menuContents={{
              labels: {
                Device: t('navbar.fromMyDevice'),
                Google: uploadFromText('Google Drive'),
                Dropbox: uploadFromText('Dropbox'),
              },
              title: t('topFeaturesSection.popperSignaturesTitle'),
            }}
            menuProps={{
              closeOnScroll: {
                elementRef: {
                  current: scrollRef,
                },
              },
            }}
            opened={opened}
            setOpened={setOpened}
          />
        )}
      </div>
      <FeatureItem icon="logo-sign-lg" content={t('topFeaturesSection.getSignatures')} withFocusable={false} />
    </div>
  );
};

export const SignUploadContainer = () => {
  const { orgName } = useParams<{ orgName: string }>();
  if (isDisabledSignMf) {
    return null;
  }
  return (
    <div className={styles.signUploadContainer}>
      <UploadContainer orgName={orgName} />
    </div>
  );
};

export default GetSignatures;
