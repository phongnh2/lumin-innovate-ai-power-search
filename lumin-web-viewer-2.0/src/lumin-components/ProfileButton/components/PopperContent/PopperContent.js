import classNames from 'classnames';
import { Avatar, PlainTooltip, PopoverDropdown, Text, MenuItemBase, Divider as KiwiDivider } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Img } from 'react-image';
import { connect, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { RouterContext } from 'src/navigation/Router/RouterContext';

import LetEditDark from 'assets/images/let-edit-dark.png';
import LetEdit from 'assets/images/let-edit.png';

import actions from 'actions';
import selectors from 'selectors';

import LuminPlanLabel from 'luminComponents/LuminPlanLabel';

import { useThemeMode, useTranslation } from 'hooks';
import useGetOrganizationData from 'hooks/useGetOrganizationData';
import useOrganizationRouteMatch from 'hooks/useOrganizationRouteMatch';
import { useViewerMatch } from 'hooks/useViewerMatch';

import authService from 'services/authServices';
import { kratosService } from 'services/oryServices';
import userServices from 'services/userServices';

import { isChrome, isWindow10 } from 'helpers/device';
import isMobileOrTablet from 'helpers/isMobileOrTablet';
import logger from 'helpers/logger';

import { avatar } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { APP_DOWNLOAD, LOGGER, ModalTypes, STATUS_CODE, THEME_MODE, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { Routers, STATIC_PAGE_PRICING } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { SettingTabEnum } from 'constants/settingConstant';
import { AUTH_SERVICE_URL, BASEURL } from 'constants/urls';

import { MenuItemLink } from '../LinkComponent/LinkComponent';
import OrganizationProfile from '../OrganizationProfile';

import styles from './PopperContent.module.scss';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  closePopper: PropTypes.func,
  currentDocument: PropTypes.object,
  onClose: PropTypes.func,
};

const defaultProps = {
  closePopper: () => {},
  currentDocument: {},
  onClose: () => {},
};

const DownloadLinkComponent = (_props) =>
  isWindow10() ? (
    <a tabIndex={-1} href={APP_DOWNLOAD.MS_STORE} target="_blank" rel="noreferrer" {..._props}>
      {_props.children}
    </a>
  ) : (
    <Link tabIndex={-1} to={Routers.DOWNLOAD} {..._props}>
      {_props.children}
    </Link>
  );

const PopperContent = (props) => {
  const { currentUser, closePopper, currentDocument, onClose } = props;
  const organization = useGetOrganizationData();
  const { hasInstalledPwa } = useContext(RouterContext);
  const shouldShowDownloadPwa = (!hasInstalledPwa || !isChrome) && !isMobileOrTablet();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const location = useLocation();
  const { isViewer } = useViewerMatch();
  const { orgRouteMatch: isOrgPage } = useOrganizationRouteMatch();
  const signOut = async () => {
    try {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );
      await kratosService.signOut(() => {
        logger.logInfo({
          message: LOGGER.EVENT.SIGN_OUT,
          reason: LOGGER.Service.KRATOS_INFO,
        });
        authService.afterSignOut();
      });
    } catch (error) {
      const code = error?.response?.data?.error?.code;
      if (code === STATUS_CODE.UNAUTHORIZED) {
        window.location.reload();
        return;
      }
      logger.logError({
        reason: LOGGER.Service.KRATOS_ERROR,
        error,
      });
      const modalSetting = {
        type: ModalTypes.ERROR,
        title: 'Sign Out Failed!',
        message: 'Please try again later.',
      };
      dispatch(actions.closeModal());
      dispatch(actions.openModal(modalSetting));
    }
  };

  const handleClosePopper = () => {
    closePopper();
    onClose();
  };

  const confirmSignOut = () => {
    handleClosePopper();
    const modalSetting = {
      type: ModalTypes.WARNING,
      title: t('signOutModal.title'),
      message: t('signOutModal.message'),
      confirmButtonTitle: t('common.yes'),
      useReskinModal: true,
      onCancel: () => {},
      onConfirm: signOut,
      closeOnRouteChange: false,
    };
    dispatch(actions.openModal(modalSetting));
  };

  const handleClickMySettings = () => {
    handleClosePopper();
    sessionStorage.setItem(SESSION_STORAGE_KEY.PREVIOUS_PATH, location.pathname);
  };

  if (!currentUser) {
    return null;
  }

  const renderToolsDesc = () => {
    if (currentDocument && (currentDocument.isSystemFile || currentDocument.isShared)) {
      const documentType = currentDocument.isSystemFile ? t('common.local') : t('viewer.header.shared');
      return (
        <div className={classNames(styles.section, styles.sponsoredToolsWrapper)}>
          <Img src={themeMode === THEME_MODE.DARK ? LetEditDark : LetEdit} alt="let-edit" height={38} />
          <Text type="title" size="xs">
            {t('profileButton.toolsDesc', { documentType: documentType.toLowerCase() })}
          </Text>
        </div>
      );
    }
  };

  const getPlanTypeInViewer = () => {
    const isPersonalWorkspace =
      !currentDocument.belongsTo.workspaceId && currentDocument.documentType === DOCUMENT_TYPE.PERSONAL;
    if (isPersonalWorkspace) {
      return currentUser.payment;
    }
    return currentDocument.documentReference?.data.payment;
  };

  const getPayment = () => {
    if (isViewer && !currentDocument.isShared && !currentDocument.isGuest && !currentDocument.isSystemFile) {
      return getPlanTypeInViewer();
    }
    const { payment: highestPayment } = userServices.getPlanType(currentUser, []);
    return isViewer ? null : highestPayment;
  };

  const payment = getPayment();

  return (
    <PopoverDropdown paddingVariant="dense" className={styles.container}>
      <div className={classNames(styles.section, styles.userInfo)}>
        <Avatar size="lg" src={avatar.getAvatar(currentUser.avatarRemoteId)} name={currentUser.name} />
        <div className={classNames(styles.textWrapper, styles.userNameWrapper)}>
          <PlainTooltip content={currentUser.name} position="bottom" openDelay={TOOLTIP_OPEN_DELAY}>
            <Text type="headline" size="xs" className={styles.name} ellipsis>
              {currentUser && currentUser.name}
            </Text>
          </PlainTooltip>
        </div>
        <div className={styles.textWrapper}>
          <PlainTooltip content={currentUser.email} position="bottom" openDelay={TOOLTIP_OPEN_DELAY}>
            <Text
              type="body"
              size="sm"
              className={styles.name}
              ellipsis
              color="var(--kiwi-colors-surface-on-surface-low)"
            >
              {currentUser && currentUser.email}
            </Text>
          </PlainTooltip>
        </div>
        {!isOrgPage && payment && (
          <div className={styles.personalPlanChipWrapper}>
            <LuminPlanLabel paymentType={payment.type} useReskinChip className={styles.personalPlanChipWrapper} />
          </div>
        )}
      </div>
      {organization && !currentDocument?.isShared && (
        <OrganizationProfile currentOrganization={organization} handleClosePopper={handleClosePopper} />
      )}
      {renderToolsDesc()}
      <div className={classNames(styles.section, styles.menuSection)}>
        <MenuItemLink
          leftIconProps={{ type: 'user-lg', size: 'lg' }}
          to={AUTH_SERVICE_URL + getFullPathWithPresetLang('/profile-settings')}
        >
          {t('common.profile')}
        </MenuItemLink>
        <MenuItemLink
          to={`${BASEURL}${Routers.SETTINGS.ROOT}/${SettingTabEnum.GENERAL}`}
          leftIconProps={{ type: 'settings-lg', size: 'lg' }}
          onClick={handleClickMySettings}
        >
          {t('common.mySettings')}
        </MenuItemLink>
        <KiwiDivider my="var(--kiwi-spacing-1)" />
        <MenuItemLink
          leftIconProps={{ type: 'crown-lg', size: 'lg' }}
          to={STATIC_PAGE_PRICING}
          onClick={handleClosePopper}
        >
          {t('profileButton.pricingFeatures')}
        </MenuItemLink>
        {shouldShowDownloadPwa && (
          <DownloadLinkComponent
            className={styles.downLoadAppLink}
            data-lumin-btn-name={ButtonName.LUMIN_DOWNLOAD}
            data-lumin-btn-purpose={ButtonPurpose[ButtonName.LUMIN_DOWNLOAD]}
          >
            <MenuItemBase leftIconProps={{ type: 'download-lg', size: 'lg' }}>
              {t('profileButton.installLumin')}
            </MenuItemBase>
          </DownloadLinkComponent>
        )}
        <MenuItemBase
          leftIconProps={{ type: 'logout-lg', size: 'lg' }}
          onClick={confirmSignOut}
          className={styles.logout}
        >
          {t('common.signOut')}
        </MenuItemBase>
      </div>
    </PopoverDropdown>
  );
};

PopperContent.propTypes = propTypes;
PopperContent.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizations: selectors.getOrganizationList(state).data || [],
  currentDocument: selectors.getCurrentDocument(state),
});

export default connect(mapStateToProps)(PopperContent);
