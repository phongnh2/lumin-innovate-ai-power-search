// eslint-disable-next-line import/no-unresolved
import { GearIcon } from '@luminpdf/icons/dist/csr/Gear';
import classNames from 'classnames';
import { Text, Button, PlainTooltip, IconButton, Divider } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import SlackLogo from 'assets/reskin/lumin-svgs/slack-logo.svg';

import { useTranslation, useTabletMatch, useRestrictedUser } from 'hooks';

import { hotjarUtils, string as stringUtils, toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { MAX_TRUNCATE_DOCUMENT_NAME } from 'constants/documentConstants';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';

import styles from '../ShareModal.module.scss';

const Title = (props) => {
  const {
    hasPermission,
    onBack,
    showBackButton,
    backTooltip,
    title,
    documentName,
    openShareInSlack,
    titleElement,
    backButtonProps,
    backTooltipProps,
    hasSlackPermission,
    openBulkUpdate,
    enableEditDocumentActionPermission,
    canBulkUpdate,
  } = {
    onBack: () => {},
    showBackButton: false,
    title: '',
    backTooltip: '',
    documentName: '',
    openShareInSlack: null,
    titleElement: null,
    backButtonProps: {
      onClick: props.onBack,
      ...props.backButtonProps,
    },
    backTooltipProps: {},
    openBulkUpdate: () => {},
    enableEditDocumentActionPermission: false,
    canBulkUpdate: false,
    ...props,
  };
  const { t } = useTranslation();
  const isTabletUpMatch = useTabletMatch();
  const { isDriveOnlyUser } = useRestrictedUser();
  const truncateDocumentName = stringUtils.getShortStringWithLimit(
    documentName,
    isTabletUpMatch ? MAX_TRUNCATE_DOCUMENT_NAME.DESKTOP : MAX_TRUNCATE_DOCUMENT_NAME.MOBILE
  );

  const onClickShareInSlack = () => {
    hotjarUtils.trackEvent(HOTJAR_EVENT.CLICK_SHARE_IN_SLACK);
    if (isDriveOnlyUser) {
      toastUtils.error({ message: ERROR_MESSAGE_RESTRICTED_ACTION });
      return;
    }
    openShareInSlack();
  };

  const showSlackButton = hasPermission && !showBackButton && hasSlackPermission;
  const showSettingButton = (canBulkUpdate || (enableEditDocumentActionPermission && hasPermission)) && !showBackButton;

  return (
    <div className={styles.titleContainer}>
      <div
        className={classNames(styles.titleWrapper, {
          [styles.titleWrapperWithBackButton]: showSlackButton || showBackButton,
        })}
      >
        {showBackButton && (
          <PlainTooltip content={backTooltip || t('common.back')} {...backTooltipProps}>
            <IconButton
              size="lg"
              icon="ph-arrow-left"
              className={classNames(styles.backButton, backButtonProps.className)}
              onClick={onBack}
              {...backButtonProps}
            />
          </PlainTooltip>
        )}
        {titleElement || (
          <Text
            type="headline"
            size="lg"
            className={classNames(styles.title, {
              [styles.titleWithSlackButton]: showSlackButton,
            })}
            component="div"
          >
            {title || (hasPermission ? `${t('common.share')} "${truncateDocumentName}"` : t('modalShare.shareList'))}
          </Text>
        )}
      </div>
      <div
        className={classNames(styles.buttonWrapper, {
          [styles.buttonWrapperWithSlackButton]: showSlackButton,
          [styles.buttonWrapperWithSettingsButton]: showSettingButton,
        })}
      >
        {showSlackButton && (
          <div className={styles.slackButtonWrapper}>
            <Button
              size="lg"
              variant="text"
              endIcon={<img src={SlackLogo} alt="slack-logo" />}
              className={styles.slackButton}
              data-cy="share_in_slack_button"
              onClick={onClickShareInSlack}
              data-lumin-btn-name={ButtonName.SHARE_IN_SLACK}
            >
              {t('modalShare.shareInSlack')}
            </Button>
          </div>
        )}
        {showSlackButton && showSettingButton && <Divider orientation="vertical" className={styles.divider} />}
        {showSettingButton && (
          <PlainTooltip content={t('common.settings')}>
            <IconButton
              size="lg"
              icon={<GearIcon height={24} width={24} />}
              onClick={openBulkUpdate}
              className={styles.settingsButton}
            />
          </PlainTooltip>
        )}
      </div>
    </div>
  );
};

Title.propTypes = {
  hasPermission: PropTypes.bool,
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  bottomGap: PropTypes.bool,
  title: PropTypes.string,
  backTooltip: PropTypes.string,
  documentName: PropTypes.string,
  openShareInSlack: PropTypes.func,
  backButtonClassname: PropTypes.any,
  titleElement: PropTypes.node,
  backButtonProps: PropTypes.object,
  enableEditDocumentActionPermission: PropTypes.bool,
};

Title.defaultProps = {
  onBack: () => {},
  showBackButton: false,
  bottomGap: true,
  title: '',
  backTooltip: '',
  documentName: '',
  openShareInSlack: null,
  backButtonClassname: null,
  titleElement: null,
  backButtonProps: {},
  enableEditDocumentActionPermission: false,
};

export default Title;
