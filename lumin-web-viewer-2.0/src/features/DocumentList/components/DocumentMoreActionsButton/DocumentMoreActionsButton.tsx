import { IconButton, Divider, MenuItem, Switch, MenuItemProps, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { DocumentListContext } from 'luminComponents/DocumentList/Context';
import { ScrollableMenu } from 'luminComponents/ReskinLayout/components/ScrollableMenu';

import withDocumentItemAuthorization from 'HOC/withDocumentItemAuthorization';

import { useDesktopMatch, useGetCurrentUser, useTranslation } from 'hooks';

import { canEnableOffline } from 'helpers/pwa';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import {
  DocumentDropdownAction,
  ObjectType,
  QuickAction,
} from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { DocumentActionsType } from 'features/DocumentList/types';

import { DOCUMENT_OFFLINE_STATUS, DOCUMENT_TYPE, DocumentActions } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { DOCUMENT_ROLES, STORAGE_TYPE, THIRD_PARTY_DOCUMENT_SERVICES } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import styles from './DocumentMoreActionsButton.module.scss';

type MenuOptionsMappingValueType = {
  title: string;
  icon: MenuItemProps['leftIconProps'];
  clickAction: (...args: unknown[]) => void;
  precheckingRequired?: boolean;
  expiredBlocking?: boolean;
  disabledFeature?: boolean;
  tooltip?: string;
  switchButton?: {
    display: boolean;
    checked: boolean;
    disabled?: boolean;
  };
  btnName?: typeof ButtonName[keyof typeof ButtonName];
  feature: DocumentDropdownAction;
};

type MenuOptionsMappingType = {
  [key: typeof DocumentActions[keyof typeof DocumentActions]]: MenuOptionsMappingValueType;
};

type DocumentMoreActionsButtonProps = {
  document: IDocumentBase;
  containerScrollRef: React.MutableRefObject<HTMLElement>;
  withAuthorize: (action: string) => boolean;
  onToggle?: (value: boolean) => void;
  actions: DocumentActionsType;
  checkCapabilitiesDocumentPermission: (action: string) => boolean;
};

const DocumentMoreActionsButton = (props: DocumentMoreActionsButtonProps) => {
  const { document, withAuthorize, actions, containerScrollRef, onToggle, checkCapabilitiesDocumentPermission } = props;

  const [openedMenu, setOpenedMenu] = useState(false);

  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const isDesktopMatch = useDesktopMatch();

  const isSourceDownloading = useSelector(selectors.isSourceDownloading);

  const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;

  // context
  const { externalDocumentExistenceGuard, onHandleDocumentOvertimeLimit } = useContext(DocumentListContext) || {};

  // [START] star action
  const isStarred = document.listUserStar && document.listUserStar.includes(currentUser._id);
  // [END] star action

  // [START] delete action
  const canDeleteDocument =
    document.roleOfDocument === DOCUMENT_ROLES.OWNER ||
    [DOCUMENT_TYPE.ORGANIZATION_TEAM, DOCUMENT_TYPE.ORGANIZATION].includes(document.documentType);
  // [END] delete action

  const menuOptionsMapping: MenuOptionsMappingType = {
    [DocumentActions.View]: {
      title: t('common.fileInfo'),
      icon: { type: 'file-md' },
      clickAction: actions.viewInfo,
      feature: DocumentDropdownAction.FILE_INFO,
    },
    [DocumentActions.Open]: {
      title: t('common.open'),
      icon: { type: 'file-open-md' },
      clickAction: actions.open,
      feature: DocumentDropdownAction.OPEN,
    },
    [DocumentActions.MakeACopy]: {
      title: t('common.makeACopy'),
      icon: { type: 'copy-md' },
      clickAction: actions.makeACopy,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.COPY_DOC,
    },
    [DocumentActions.Rename]: {
      title: t('common.rename'),
      icon: { type: 'pencil-md' },
      clickAction: actions.rename,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.RENAME,
    },
    [DocumentActions.CopyLink]: {
      title: t('modalShare.copyLink'),
      icon: { type: 'link-md' },
      clickAction: actions.copyLink,
      precheckingRequired: true,
      expiredBlocking: true,
      btnName: ButtonName.COPY_LINK,
      feature: DocumentDropdownAction.COPY_LINK,
    },
    [DocumentActions.Share]: {
      title: t('common.share'),
      icon: { type: 'share-md' },
      clickAction: actions.share,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.SHARE,
    },
    [DocumentActions.MarkFavorite]: {
      title: isStarred ? t('common.unstar') : t('common.star'),
      icon: {
        type: isStarred ? 'star-fill-md' : 'star-md',
        ...(isStarred && { color: 'var(--kiwi-colors-custom-brand-tools-esign)' }),
      },
      clickAction: actions.markFavorite,
      feature: DocumentDropdownAction.STAR,
    },
    [DocumentActions.Move]: {
      title: t('common.move'),
      icon: { type: 'move-md' },
      clickAction: actions.move,
      precheckingRequired: true,
      expiredBlocking: true,
      feature: DocumentDropdownAction.MOVE,
    },
    [DocumentActions.MakeOffline]: {
      title: t('common.availableOffline'),
      icon: { type: 'cloud-download-md' },
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
      icon: { type: 'trash-md' },
      clickAction: actions.remove,
      feature: DocumentDropdownAction.DELETE,
    },
  };

  const withClosePopper = (callback: (...args: unknown[]) => void) => {
    if (typeof callback !== 'function') {
      return;
    }
    callback();
    setOpenedMenu(false);
    onToggle?.(false);
  };

  const onItemClick = (
    item: MenuOptionsMappingValueType,
    documentAction: typeof DocumentActions[keyof typeof DocumentActions]
  ) => {
    withClosePopper((...rest) => {
      if (item.precheckingRequired) {
        externalDocumentExistenceGuard(document, () => item.clickAction(...rest), documentAction);
      } else {
        item.clickAction(...rest);
      }
    });
  };

  const onClickItem = ({
    expiredBlocking,
    item,
    documentAction,
  }: {
    expiredBlocking: boolean;
    item: MenuOptionsMappingValueType;
    documentAction: typeof DocumentActions[keyof typeof DocumentActions];
  }) => {
    if (document.isOverTimeLimit && expiredBlocking) {
      onHandleDocumentOvertimeLimit(document);
    } else {
      onItemClick(item, documentAction);
    }
  };

  const renderMenuItem = (documentAction: typeof DocumentActions[keyof typeof DocumentActions]) => {
    const item = menuOptionsMapping[documentAction];
    const { title, icon, switchButton, btnName = '', expiredBlocking = false, disabledFeature = false } = item;
    const { display, checked, disabled = false } = switchButton || {};
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      docActionsEvent
        .documentDropdown({
          action: item.feature,
        })
        .catch(() => {});
      onClickItem({ expiredBlocking, item, documentAction });
    };
    const isNoHavePermissionToAction = !checkCapabilitiesDocumentPermission(documentAction);
    return (
      withAuthorize(documentAction) &&
      item && (
        <PlainTooltip content={t('shareSettings.permissionDenied')} disabled={!isNoHavePermissionToAction}>
          <MenuItem
            leftIconProps={icon}
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

  // [START] makeOfflineItemVisible
  const isDocPDF = document.mimeType === general.PDF;

  const makeOfflineItemVisible =
    canEnableOffline() && isDocPDF && !isSystemFile && document.service !== STORAGE_TYPE.ONEDRIVE;
  // [END] makeOfflineItemVisible

  const onClickOnMoreActionsButton = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    docActionsEvent
      .quickActions({
        object: ObjectType.DOC,
        action: QuickAction.MORE_ACTIONS,
      })
      .catch(() => {});
  };

  return (
    <ScrollableMenu
      ComponentTarget={
        <IconButton
          data-cy="more_actions_button"
          icon="dots-vertical-md"
          size="md"
          activated={openedMenu}
          {...(!isDesktopMatch && { iconColor: 'var(--kiwi-colors-surface-on-surface-variant)' })}
          onClick={onClickOnMoreActionsButton}
        />
      }
      opened={openedMenu}
      onChange={(value) => {
        setOpenedMenu(value);
        onToggle?.(value);
      }}
      position="bottom-end"
      closeOnScroll={{ elementRef: containerScrollRef }}
      classNames={{
        dropdown: styles.dropdown,
      }}
      /* Mantine Menu returns focus shortly after close; disable it to avoid stealing focus from ShareModal input. */
      returnFocus={false}
    >
      {renderMenuItem(DocumentActions.View)}
      {renderMenuItem(DocumentActions.Open)}
      {!isSystemFile && renderMenuItem(DocumentActions.MakeACopy)}
      <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
      {!isSystemFile && renderMenuItem(DocumentActions.Rename)}
      {renderMenuItem(DocumentActions.CopyLink)}
      {!isSystemFile && renderMenuItem(DocumentActions.Share)}
      {!isSystemFile && renderMenuItem(DocumentActions.MarkFavorite)}
      {!isSystemFile && renderMenuItem(DocumentActions.Move)}
      {makeOfflineItemVisible && renderMenuItem(DocumentActions.MakeOffline)}
      {withAuthorize(DocumentActions.Remove) && (
        <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
      )}
      {renderMenuItem(DocumentActions.Remove)}
    </ScrollableMenu>
  );
};

export default withDocumentItemAuthorization(DocumentMoreActionsButton);
