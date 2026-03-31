import { Divider, IconButton, MenuItem, PlainTooltip, Switch } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import ActionItemSwitch from 'lumin-components/ActionItemSwitch';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { DocumentContext } from 'luminComponents/Document/context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';
import Icomoon from 'luminComponents/Icomoon';
import { ScrollableMenu } from 'luminComponents/ReskinLayout/components/ScrollableMenu';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';

import { useDesktopMatch, useEnableWebReskin, useTranslation } from 'hooks';

import { matchPaths } from 'helpers/matchPaths';
import { canEnableOffline } from 'helpers/pwa';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { DocumentDropdownAction, ObjectType, QuickAction } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { useUploadToLuminChecker } from 'features/CustomDomainRules/hooks/useUploadToLuminChecker';

import { DocumentActions, DOCUMENT_TYPE, DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { DOCUMENT_ROLES, STORAGE_TYPE, THIRD_PARTY_DOCUMENT_SERVICES } from 'constants/lumin-common';
import { ROUTE_MATCH } from 'constants/Routers';
import { Colors } from 'constants/styles';

import useClickMenu from '../../hooks/useSelectItems/useClickMenu';

import * as Styled from './DocumentItemPopper.styled';

const propTypes = {
  document: PropTypes.object,
  className: PropTypes.string,
  closePopper: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    viewInfo: PropTypes.func,
    open: PropTypes.func,
    rename: PropTypes.func,
    copyLink: PropTypes.func,
    share: PropTypes.func,
    markFavorite: PropTypes.func,
    remove: PropTypes.func,
    shareDocument: PropTypes.func,
    move: PropTypes.func,
    makeACopy: PropTypes.func,
    createAsTemplate: PropTypes.func,
    makeOffline: PropTypes.func,
    uploadToLumin: PropTypes.func,
  }),
  withAuthorize: PropTypes.func,
  openMenu: PropTypes.bool,
  setOpenMenu: PropTypes.func,
  checkCapabilitiesDocumentPermission: PropTypes.func,
};

const defaultProps = {
  document: {},
  className: '',
  actions: {
    viewInfo: () => {},
    open: () => {},
    rename: () => {},
    markFavorite: () => {},
    copyLink: () => {},
    share: () => {},
    remove: () => {},
    move: () => {},
    makeOffline: () => {},
    uploadToLumin: () => {},
  },
  withAuthorize: () => {},
  openMenu: false,
  setOpenMenu: () => {},
  checkCapabilitiesDocumentPermission: () => {},
};

function DocumentItemPopper(props) {
  const { isEnableReskin } = useEnableWebReskin();
  const { closePopper, className, actions, withAuthorize, document, checkCapabilitiesDocumentPermission } = props;
  const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
  const { externalDocumentExistenceGuard, onHandleDocumentOvertimeLimit } = useContext(DocumentListContext) || {};
  const { handleSelectedItems, shiftHoldingRef, lastSelectedDocIdRef } = useContext(DocumentContext);
  const { bodyScrollRef } = useContext(AppLayoutContext);

  const { onClickMenu } = useClickMenu({ item: document, handleSelectedItems, shiftHoldingRef, lastSelectedDocIdRef });
  const { disabled, tooltipData = {} } = useUploadToLuminChecker();
  const currentUser = useSelector(selectors.getCurrentUser);
  const isSourceDownloading = useSelector(selectors.isSourceDownloading);
  const isDesktopMatch = useDesktopMatch();

  const isSharedDocumentRoute = Boolean(
    matchPaths(
      [ROUTE_MATCH.SHARED_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const { t } = useTranslation();

  let isStarred;

  if (isSystemFile) {
    isStarred = document.isStarred;
  } else {
    isStarred = document.listUserStar && document.listUserStar.includes(currentUser._id);
  }

  const starIcon = {
    className: !isStarred ? 'star-filled' : 'star-empty',
    label: isStarred ? t('common.unstar') : t('common.star'),
  };

  const withClosePopper = (callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    callback();
    if (isEnableReskin) {
      props.setOpenMenu(false);
      return;
    }
    closePopper();
  };

  const canDeleteDocument =
    document.roleOfDocument === DOCUMENT_ROLES.OWNER ||
    ([DOCUMENT_TYPE.ORGANIZATION_TEAM, DOCUMENT_TYPE.ORGANIZATION].includes(document.documentType) &&
      !isSharedDocumentRoute);

  const menuOptionsMapping = {
    [DocumentActions.View]: {
      title: t('common.fileInfo'),
      icon: 'file-info',
      clickAction: actions.viewInfo,
      feature: DocumentDropdownAction.FILE_INFO,
    },
    [DocumentActions.Open]: {
      title: t('common.open'),
      icon: 'open-file',
      iconSize: 20,
      clickAction: actions.open,
      feature: DocumentDropdownAction.OPEN,
    },
    [DocumentActions.UploadToLumin]: {
      title: t('documentPage.uploadToLumin'),
      icon: 'file-info',
      clickAction: actions.uploadToLumin,
      feature: DocumentDropdownAction.UPLOAD_TO_LUMIN,
    },
    [DocumentActions.MakeACopy]: {
      title: t('common.makeACopy'),
      icon: 'copy',
      clickAction: actions.makeACopy,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.COPY_DOC,
    },
    [DocumentActions.Rename]: {
      title: t('common.rename'),
      icon: 'edit',
      clickAction: actions.rename,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.RENAME,
    },
    [DocumentActions.CopyLink]: {
      title: t('modalShare.copyLink'),
      icon: 'share',
      clickAction: actions.copyLink,
      precheckingRequired: true,
      expiredBlocking: true,
      btnName: ButtonName.COPY_LINK,
      feature: DocumentDropdownAction.COPY_LINK,
    },
    [DocumentActions.Share]: {
      title: t('common.share'),
      icon: 'icon-connections',
      clickAction: actions.share,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.SHARE,
    },
    [DocumentActions.MarkFavorite]: {
      title: starIcon.label,
      icon: starIcon.className,
      clickAction: actions.markFavorite,
      feature: DocumentDropdownAction.STAR,
    },
    [DocumentActions.UploadLumin]: {
      title: t('documentPage.uploadToLumin'),
      icon: 'file-info',
      clickAction: actions.uploadToLumin,
      disabledFeature: disabled,
      tooltip: tooltipData.title,
      feature: DocumentDropdownAction.UPLOAD_TO_LUMIN,
    },
    [DocumentActions.Move]: {
      title: t('common.move'),
      icon: 'move-file',
      clickAction: actions.move,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.MOVE,
    },
    [DocumentActions.MakeOffline]: {
      title: t('common.availableOffline'),
      icon: 'available-offline',
      tooltip:
        isSourceDownloading || document.offlineStatus === DOCUMENT_OFFLINE_STATUS.DOWNLOADING
          ? t('common.settingUpOffline')
          : '',
      clickAction: actions.makeOffline,
      precheckingRequired: true,
      expiredBlocking: true,
      switchButton: {
        display: true,
        checked: document.offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE,
        disabled: document.offlineStatus === DOCUMENT_OFFLINE_STATUS.DOWNLOADING || isSourceDownloading,
      },
      btnName:
        document.offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE
          ? ButtonName.MAKE_OFFLINE_FILE_UNAVAILABLE_IN_DOCLIST
          : ButtonName.MAKE_OFFLINE_FILE_IN_DOCLIST,
      feature: DocumentDropdownAction.MAKE_OFFLINE,
    },
    [DocumentActions.Remove]: {
      title:
        canDeleteDocument && !THIRD_PARTY_DOCUMENT_SERVICES.includes(document.service)
          ? t('common.delete')
          : t('common.remove'),
      icon: 'trash',
      clickAction: actions.remove,
      feature: DocumentDropdownAction.DELETE,
    },
    /* FIXME */
    // [DocumentActions.CreateAsTemplate]: {
    //   title: t('common.createAsTemplate'),
    //   icon: 'location-template',
    //   clickAction: actions.createAsTemplate,
    //   btnName: ButtonName.TEMPLATE_CREATE_DOCLIST,
    //   expiredBlocking: true,
    // },
  };

  const onItemClick = (item, documentAction) => {
    withClosePopper((...rest) => {
      if (item.precheckingRequired) {
        externalDocumentExistenceGuard(document, () => item.clickAction(...rest), documentAction);
      } else {
        item.clickAction(...rest);
      }
    });
  };

  const onClickItem = ({ expiredBlocking, item, documentAction }) => {
    docActionsEvent.documentDropdown({
      action: item.feature,
    });
    if (document.isOverTimeLimit && expiredBlocking) {
      onHandleDocumentOvertimeLimit(document);
    } else {
      onItemClick(item, documentAction);
    }
  };

  const renderMenuItem = (documentAction) => {
    const item = menuOptionsMapping[documentAction];
    const {
      icon,
      title,
      switchButton,
      tooltip = '',
      btnName = '',
      expiredBlocking = false,
      disabledFeature = false,
      iconSize = 16,
    } = item;
    const { display, checked, disabled = false } = switchButton || {};
    const onClick = () => onClickItem({ expiredBlocking, item, documentAction });
    return (
      withAuthorize(documentAction) &&
      item && (
        <Tooltip title={tooltip} PopperProps={{ disablePortal: true }} tooltipStyle={{ zIndex: 4 }} placement="bottom">
          <div>
            <Styled.CustomActionItem onClick={onClick} data-lumin-btn-name={btnName} disabled={disabledFeature}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icomoon className={icon} size={iconSize} color={Colors.NEUTRAL_80} />
                <Styled.ActionText $isOfflineAction={documentAction === DocumentActions.MakeOffline}>
                  {title}
                </Styled.ActionText>
              </div>
              {display && <ActionItemSwitch checked={checked} disabled={disabled} />}
            </Styled.CustomActionItem>
          </div>
        </Tooltip>
      )
    );
  };

  const renderMenuItemReskin = (documentAction) => {
    const menuIconsReskin = {
      [DocumentActions.View]: { type: 'file-md' },
      [DocumentActions.Open]: { type: 'file-open-md' },
      [DocumentActions.MakeACopy]: { type: 'copy-md' },
      [DocumentActions.Rename]: { type: 'pencil-md' },
      [DocumentActions.CopyLink]: { type: 'link-md' },
      [DocumentActions.Share]: { type: 'share-md' },
      [DocumentActions.MarkFavorite]: {
        type: isStarred ? 'star-fill-md' : 'star-md',
        ...(isStarred && { color: 'var(--kiwi-colors-custom-brand-tools-esign)' }),
      },
      [DocumentActions.Move]: { type: 'move-md' },
      [DocumentActions.MakeOffline]: { type: 'cloud-download-md' },
      [DocumentActions.Remove]: { type: 'trash-md' },
    };
    const item = menuOptionsMapping[documentAction];
    const { title, switchButton, btnName = '', expiredBlocking = false, disabledFeature = false } = item;
    const iconProps = menuIconsReskin[documentAction];
    const { display, checked, disabled = false } = switchButton || {};
    const onClick = () => onClickItem({ expiredBlocking, item, documentAction });
    const isNoHavePermissionToAction = !checkCapabilitiesDocumentPermission(documentAction);

    return (
      withAuthorize(documentAction) &&
      item && (
        <PlainTooltip content={t('shareSettings.permissionDenied')} disabled={!isNoHavePermissionToAction}>
          <MenuItem
            leftIconProps={iconProps}
            rightSection={display ? <Switch checked={checked} disabled={disabled} /> : null}
            onClick={onClick}
            data-lumin-btn-name={btnName}
            disabled={disabledFeature || isNoHavePermissionToAction}
          >
            {title}
          </MenuItem>
        </PlainTooltip>
      )
    );
  };

  const isDocPDF = document.mimeType === general.PDF;

  const makeOfflineItemVisible =
    canEnableOffline() && isDocPDF && !isSystemFile && document.service !== STORAGE_TYPE.ONEDRIVE;

  if (isEnableReskin) {
    const { openMenu, setOpenMenu } = props;

    const onHandleOpenMenu = () => {
      setOpenMenu(true);
      onClickMenu();
    };

    const trackClickMoreActionsButton = () => {
      docActionsEvent.quickActions({
        object: ObjectType.DOC,
        action: QuickAction.MORE_ACTIONS,
      });
    };

    return (
      <ScrollableMenu
        width={280}
        ComponentTarget={
          <IconButton
            data-cy="more_actions_button"
            icon="dots-vertical-md"
            size="md"
            activated={openMenu}
            onClick={trackClickMoreActionsButton}
            {...(!isDesktopMatch && { iconColor: 'var(--kiwi-colors-surface-on-surface-variant)' })}
          />
        }
        onClose={() => setOpenMenu(false)}
        onOpen={onHandleOpenMenu}
        position="bottom-end"
        closeOnScroll={{ elementRef: bodyScrollRef }}
      >
        {renderMenuItemReskin(DocumentActions.View)}
        {renderMenuItemReskin(DocumentActions.Open)}
        {!isSystemFile && renderMenuItemReskin(DocumentActions.MakeACopy)}
        <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        {!isSystemFile && renderMenuItemReskin(DocumentActions.Rename)}
        {renderMenuItemReskin(DocumentActions.CopyLink)}
        {!isSystemFile && renderMenuItemReskin(DocumentActions.Share)}
        {!isSystemFile && renderMenuItemReskin(DocumentActions.MarkFavorite)}
        {!isSystemFile && renderMenuItemReskin(DocumentActions.Move)}
        {makeOfflineItemVisible && renderMenuItemReskin(DocumentActions.MakeOffline)}
        {withAuthorize(DocumentActions.Remove) && (
          <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
        )}
        {renderMenuItemReskin(DocumentActions.Remove)}
      </ScrollableMenu>
    );
  }

  return (
    <Styled.CustomMenu className={className} disablePadding>
      {renderMenuItem(DocumentActions.View)}
      {renderMenuItem(DocumentActions.Open)}
      {!isSystemFile && renderMenuItem(DocumentActions.MakeACopy)}
      {withAuthorize(DocumentActions.View) && <Styled.CustomDivider />}

      {!isSystemFile && renderMenuItem(DocumentActions.Rename)}
      {renderMenuItem(DocumentActions.CopyLink)}
      {!isSystemFile && renderMenuItem(DocumentActions.Share)}
      {isSystemFile && renderMenuItem(DocumentActions.UploadLumin)}
      {!isSystemFile && renderMenuItem(DocumentActions.MarkFavorite)}
      {!isSystemFile && renderMenuItem(DocumentActions.Move)}
      {/* FIXME */}
      {/* {isDocPDF && renderMenuItem(DocumentActions.CreateAsTemplate)} */}
      {/* LMV-3505 Temporary hide make offline for user using new layout */}
      {makeOfflineItemVisible && renderMenuItem(DocumentActions.MakeOffline)}
      {withAuthorize(DocumentActions.Remove) && <Styled.CustomDivider />}
      {renderMenuItem(DocumentActions.Remove)}
    </Styled.CustomMenu>
  );
}

DocumentItemPopper.propTypes = propTypes;
DocumentItemPopper.defaultProps = defaultProps;

export default withDocumentItemAuthorization(DocumentItemPopper);
