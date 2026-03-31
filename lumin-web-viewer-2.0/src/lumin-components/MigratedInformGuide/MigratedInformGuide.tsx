import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import Joyride from 'react-joyride';

import Speaker from 'assets/images/speaker.png';

import { useDesktopMatch, useTranslation } from 'hooks';

import { Colors, Fonts } from 'constants/styles';

import useContentMigrateModal from './hooks/useContentMigrateModal';

import * as Styled from './MigratedInformGuide.styled';

const MigratedInformGuideModal = ({
  titleKey,
  descriptionKey,
  itemsKey,
  notifyMigratedKey,
  linkTo,
}: {
  titleKey: string;
  descriptionKey: string;
  itemsKey: string[];
  notifyMigratedKey: string;
  linkTo: string;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Styled.Container>
      <Styled.TitleContainer>
        <Styled.Image src={Speaker} />
        <Styled.Title>{t(titleKey)}</Styled.Title>
      </Styled.TitleContainer>
      {descriptionKey && (
        <Styled.Description>
          <Trans i18nKey={descriptionKey} components={{ span: <span /> }} />
        </Styled.Description>
      )}
      {itemsKey && (
        <Styled.ItemContainer>
          {itemsKey.map((item, index) => (
            <Styled.Item key={index}>
              <Trans i18nKey={item} components={{ span: <span /> }} />
            </Styled.Item>
          ))}
        </Styled.ItemContainer>
      )}
      {notifyMigratedKey && (
        <Styled.Notify>
          <Trans i18nKey={notifyMigratedKey} components={{ Link: <Styled.CustomLink to={linkTo} /> }} />
        </Styled.Notify>
      )}
    </Styled.Container>
  );
};

const MigratedInformGuide = (): JSX.Element => {
  const [run, setRun] = useState(false);
  const contentMigrateModal = useContentMigrateModal();
  const { titleKey, descriptionKey, onClose, itemsKey, notifyMigratedKey, linkTo } = contentMigrateModal || {};
  const isTabletUp = useDesktopMatch();
  const { t } = useTranslation();

  useEffect(() => {
    setRun(true);
  }, []);

  if (!contentMigrateModal) {
    return null;
  }

  return (
    <Joyride
      steps={[
        {
          content: (
            <MigratedInformGuideModal
              titleKey={titleKey}
              descriptionKey={descriptionKey}
              itemsKey={itemsKey}
              notifyMigratedKey={notifyMigratedKey}
              linkTo={linkTo}
            />
          ),
          target: '.joyride-documents',
          placement: isTabletUp ? 'right-start' : 'bottom-start',
          disableBeacon: true,
          isFixed: false,
          styles: {
            spotlight: {
              borderRadius: isTabletUp ? 0 : 8,
            },
          },
        },
      ]}
      callback={onClose}
      run={run}
      disableCloseOnEsc
      disableScrollParentFix
      disableScrolling
      disableOverlayClose
      hideCloseButton
      hideBackButton
      locale={{ close: t('common.gotIt') }}
      spotlightPadding={isTabletUp ? 0 : 10}
      styles={{
        options: {
          zIndex: 1000,
        },
        tooltip: {
          width: '312px',
          padding: '12px 12px 4px',
          borderRadius: '8px',
        },
        tooltipContent: { padding: '0' },
        buttonNext: {
          fontFamily: Fonts.PRIMARY,
          fontSize: '12px',
          lineHeight: '16px',
          color: Colors.NEUTRAL_100,
          backgroundColor: Colors.WHITE,
          fontWeight: 600,
          marginTop: '-8px',
          marginRight: '-8px',
        },
      }}
      floaterProps={{
        styles: {
          arrow: {
            length: 6,
            spread: 12,
          },
        },
      }}
    />
  );
};

export default MigratedInformGuide;
