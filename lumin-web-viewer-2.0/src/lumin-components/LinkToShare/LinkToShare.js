import { Button, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';

import { useEnableWebReskin, useThemeMode, useTranslation } from 'hooks';
import useCopyLinkPurpose from 'hooks/useCopyLinkPurpose';

import { getShareLink, toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { DOCUMENT_LINK_TYPE, DOCUMENT_ROLES, TIMEOUT } from 'constants/lumin-common';

import * as Styled from './LinkToShare.styled';

import styles from './LinkToShare.module.scss';

const DESCRIPTION_ANYONE = {
  [DOCUMENT_ROLES.EDITOR]: 'modalShare.anyoneOnTheInternetCanEditWithLink',
  [DOCUMENT_ROLES.VIEWER]: 'modalShare.anyoneOnTheInternetCanCommentWithLink',
  [DOCUMENT_ROLES.SPECTATOR]: 'modalShare.anyoneOnTheInternetCanViewWithLink',
};

const LinkToShare = ({
  className,
  currentDocument,
  handleClickSharingSettings,
  canUpdateShareSettings,
}) => {
  const shareLinkRef = useRef();
  const copyTimeout = useRef();
  const { isEnableReskin } = useEnableWebReskin();
  const [isCopy, setIsCopy] = useState(false);
  const { shareSetting: { linkType, permission } } = currentDocument;
  const { t } = useTranslation();
  const copyLinkPurpose = useCopyLinkPurpose('primary');

  const LINK_TYPE_DESC = {
    [DOCUMENT_LINK_TYPE.INVITED]: {
      title: t('modalShare.restricted'),
      description: () => t('modalShare.onlySharedPeopleCanAccessWithLink'),
    },
    [DOCUMENT_LINK_TYPE.ANYONE]: {
      title: t('modalShare.anyoneWithTheLink'),
      description: (role) => t(DESCRIPTION_ANYONE[role]),
    },
  };

  const themeMode = useThemeMode();
  const themeModeProvider = Styled.theme[themeMode];

  const onCopyShareLink = () => {
    shareLinkRef.current.select();
    document.execCommand('copy');
    setIsCopy(true);
    copyTimeout.current = setTimeout(() => {
      setIsCopy(false);
    }, TIMEOUT.COPY);
    toastUtils.success({ message: t('modalShare.hasBeenCopied'), useReskinToast: true });
  };

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  const onSharingSettingKeydown = (event) => {
    if (event.key === 'Enter') {
      handleClickSharingSettings();
      event.preventDefault();
    }
  };

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Text type="headline" size="lg">
            {t('modalShare.shareLink')}
          </Text>
          <Text type="body" size="md" component="div">
            {LINK_TYPE_DESC[linkType].description(permission)}{' '}
            {canUpdateShareSettings && (
              <Text
                role="button"
                type="label"
                size="md"
                color="var(--kiwi-colors-surface-on-surface-variant)"
                component="span"
                tabIndex={0}
                onClick={handleClickSharingSettings}
                onKeyDown={onSharingSettingKeydown}
                className={styles.linkChange}
              >
                {t('common.change')}
              </Text>
            )}
          </Text>
          <Styled.Input ref={shareLinkRef} type="text" readOnly value={getShareLink(currentDocument._id)} />
        </div>
        <Button
          variant="tonal"
          size="lg"
          data-lumin-btn-name={ButtonName.COPY_LINK}
          data-lumin-btn-purpose={copyLinkPurpose}
          onClick={onCopyShareLink}
          classNames={{
            root: styles.btnRoot,
          }}
        >
          {isCopy ? t('common.copied') : t('modalShare.copyLink')}
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider theme={themeModeProvider}>
      <Styled.Container className={className}>
        <Styled.Wrapper>
          <Styled.Group>
            <Styled.Label>{t('modalShare.shareLink')}</Styled.Label>
            <Styled.Description>
              {LINK_TYPE_DESC[linkType].description(permission)}
              {canUpdateShareSettings && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClickSharingSettings}
                  onKeyDown={onSharingSettingKeydown}
                >
                  {t('common.change')}
                </span>
              )}
            </Styled.Description>
            <Styled.Input ref={shareLinkRef} type="text" readOnly value={getShareLink(currentDocument._id)} />
          </Styled.Group>
          <Styled.Group>
            <Styled.ButtonCopy
              data-lumin-btn-name={ButtonName.COPY_LINK}
              data-lumin-btn-purpose={copyLinkPurpose}
              color={ButtonColor.TERTIARY}
              onClick={onCopyShareLink}
            >
              {isCopy ? t('common.copied') : t('modalShare.copyLink')}
            </Styled.ButtonCopy>
          </Styled.Group>
        </Styled.Wrapper>
      </Styled.Container>
    </ThemeProvider>
  );
};

LinkToShare.propTypes = {
  currentDocument: PropTypes.object,
  className: PropTypes.string,
  handleClickSharingSettings: PropTypes.func,
  canUpdateShareSettings: PropTypes.bool,
};

LinkToShare.defaultProps = {
  currentDocument: {},
  className: '',
  handleClickSharingSettings: () => { },
  canUpdateShareSettings: false,
};

export default LinkToShare;
