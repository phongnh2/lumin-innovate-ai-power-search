import { Grid } from '@mui/material';
import { Switch as KiwiSwitch, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import LinkToShare from 'lumin-components/LinkToShare';
import Switch from 'lumin-components/Shared/Switch';

import { useEnableWebReskin, useTranslation } from 'hooks';

import stringUtils from 'utils/string';

import { DocumentRole } from 'constants/documentConstants';

import styles from '../ShareModal.module.scss';
import * as Styled from '../ShareModal.styled';
import { ShareModalContext } from '../ShareModalContext';

const ShareLinkSection = ({ openShareSetting, isShareLinkOpen }) => {
  const {
    isTransfering,
    openShareLink,
    isLuminStorageDocument,
    currentDocument,
    userRole,
    check3rdCookies,
  } = useContext(ShareModalContext);
  const isDocumentOwner = () => stringUtils.isIgnoreCaseEqual(userRole, DocumentRole.OWNER);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isLuminStorageDocument) {
    return (
      <LinkToShare
        currentDocument={currentDocument}
        handleClickSharingSettings={openShareSetting}
        canUpdateShareSettings={isDocumentOwner()}
      />
    );
  }
  if (isEnableReskin) {
    return (
      <div className={styles.bottomBlockWrapper}>
        <div className={styles.bottomBlockLeftSection}>
          <Text type="headline" size="lg">{t('modalShare.enableSharingLink')}</Text>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('modalShare.willUploadedToLumin')}
          </Text>
        </div>
        <KiwiSwitch
          value={t('modalShare.shareSetting')}
          checked={isShareLinkOpen}
          onChange={() => check3rdCookies(openShareLink)}
          disabled={isTransfering}
          size="md"
        />
      </div>
    );
  }
  return (
    <Grid container>
      <Grid item xs={10}>
        <div>
          <Styled.TitleSecondary>{t('modalShare.enableSharingLink')}</Styled.TitleSecondary>
          <Styled.SubTitleSecondary>
          {t('modalShare.willUploadedToLumin')}
          </Styled.SubTitleSecondary>
        </div>
      </Grid>
      <Grid item xs={2}>
        <Styled.SwitchWrapper>
          <Switch
            value={t('modalShare.shareSetting')}
            checked={isShareLinkOpen}
            onChange={() => check3rdCookies(openShareLink)}
            disabled={isTransfering}
          />
        </Styled.SwitchWrapper>
      </Grid>
    </Grid>
  );
};

ShareLinkSection.propTypes = {
  openShareSetting: PropTypes.func.isRequired,
  isShareLinkOpen: PropTypes.bool.isRequired,
};

export default ShareLinkSection;
