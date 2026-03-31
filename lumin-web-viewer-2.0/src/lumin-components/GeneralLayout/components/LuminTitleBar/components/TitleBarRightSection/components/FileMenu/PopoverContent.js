import { MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';

import selectors from 'selectors';

import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import Icomoon from 'luminComponents/Icomoon';
import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import useDocumentTools from 'hooks/useDocumentTools';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useIsSystemFile } from 'hooks/useIsSystemFile';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { openFileDestinationModal } from 'features/CopyDocumentModal/slice';
import { openDocumentInfoModal } from 'features/DocumentInfoModalContainer/slices';
import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';

import UserEventConstants from 'constants/eventConstants';

import AutoSyncSwitch from './AutoSyncSwitch';
import FullScreen from './FullScreen';
import MakeACopy from './MakeACopy';
import MoveItem from './MoveItem';
import PresenterMode from './PresenterMode';
import SaveAsTemplate from './SaveAsTemplate';
import Star from './Star';
import SwitchTheme from './SwitchTheme';
import VersionHistory from './VersionHistory';

const PopoverContent = (props) => {
  const { openMoveDocumentModal, disabledMoveDocument = false, menuItemKey = null } = props;
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { canExport, canCopy } = useShallowSelector(selectors.getDocumentCapabilities);
  const currentUser = useGetCurrentUser();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const permissionDeniedContent = t('shareSettings.permissionDenied');
  const { isSystemFile } = useIsSystemFile();
  const isDisabledDownload = !canExport && !isSystemFile;
  const isDisabledCopy = !canCopy && !isSystemFile;

  const { handleDownloadDocument } = useDocumentTools();

  const isLocalFile = () => currentDocument.isSystemFile;

  const handleOpenMakeACopyModal = () => {
    dispatch(openFileDestinationModal());
  };

  const toolsForIdentifiedUser = () => {
    if (!currentUser) {
      return null;
    }

    return [
      <Star key="star" />,
      <MakeACopy
        key="makeACopy"
        handleClick={handleOpenMakeACopyModal}
        disabled={isDisabledCopy}
        tooltipContent={isDisabledCopy ? permissionDeniedContent : undefined}
      />,
      <MoveItem onClick={openMoveDocumentModal} key="move" disabled={disabledMoveDocument} />,
      <PlainTooltip content={isDisabledDownload ? permissionDeniedContent : undefined} position="left">
        <MenuItem
          size="dense"
          leftSection={<Icomoon className="md_download" size={24} />}
          onClick={handleDownloadDocument({
            source: TriggerDownloadDocumentSource.HEADER_BUTTON,
          })}
          key="download"
          disabled={isDisabledDownload}
        >
          {t('action.download')}
        </MenuItem>
      </PlainTooltip>,
      <SaveAsTemplate key="saveAsTemplate" />,
    ];
  };

  const handleOpenFileInfo = () => {
    dispatch(openDocumentInfoModal());
  };

  const renderMenuItem = () => {
    if (!currentDocument) {
      return null;
    }

    switch (menuItemKey) {
      case QUICK_SEARCH_TOOLS.ADD_TO_STARRED:
        return currentUser && <Star key="star" />;
      case QUICK_SEARCH_TOOLS.MAKE_COPY:
        return (
          currentUser && (
            <MakeACopy
              key="makeACopy"
              handleClick={handleOpenMakeACopyModal}
              disabled={isDisabledCopy}
              tooltipContent={isDisabledCopy ? permissionDeniedContent : undefined}
            />
          )
        );
      case QUICK_SEARCH_TOOLS.MOVE_DOCUMENT:
        return currentUser && <MoveItem onClick={openMoveDocumentModal} key="move" disabled={disabledMoveDocument} />;
      case QUICK_SEARCH_TOOLS.DOWNLOAD:
        return (
          currentUser && (
            <PlainTooltip content={isDisabledDownload ? permissionDeniedContent : undefined} position="left">
              <MenuItem
                size="dense"
                leftSection={<Icomoon className="md_download" size={24} />}
                onClick={handleDownloadDocument({
                  source: TriggerDownloadDocumentSource.HEADER_BUTTON,
                })}
                key="download"
                disabled={isDisabledDownload}
              >
                {t('action.download')}
              </MenuItem>
            </PlainTooltip>
          )
        );
      case QUICK_SEARCH_TOOLS.AUTO_SYNC:
        return <AutoSyncSwitch />;
      case QUICK_SEARCH_TOOLS.DARK_MODE:
        return <SwitchTheme />;
      case QUICK_SEARCH_TOOLS.FULL_SCREEN:
        return <FullScreen />;
      case QUICK_SEARCH_TOOLS.PRESENTER_MODE:
        return currentUser && <PresenterMode />;
      case QUICK_SEARCH_TOOLS.FILE_INFO:
        return (
          currentUser && (
            <MenuItem
              leftSection={<Icomoon className="md_info" size={24} />}
              onClick={handleOpenFileInfo}
              data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.FILE_INFO}
            >
              {t('common.fileInfomation')}
            </MenuItem>
          )
        );
      case QUICK_SEARCH_TOOLS.VERSION_HISTORY:
        return <VersionHistory />;
      default:
        return null;
    }
  };

  if (menuItemKey) {
    return renderMenuItem();
  }

  return (
    currentDocument && (
      <>
        {toolsForIdentifiedUser()}

        {/*
          Temporary remove offline mode in New layout (LMV-3505)
          <OfflineMode />
        */}

        <AutoSyncSwitch />
        {!isLocalFile() && currentUser && <Divider />}

        <SwitchTheme />

        <FullScreen />

        {!!currentUser && (
          <>
            <PresenterMode />
            <Divider />
            <MenuItem
              leftSection={<Icomoon className="md_info" size={24} />}
              onClick={handleOpenFileInfo}
              data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.FILE_INFO}
            >
              {t('common.fileInfomation')}
            </MenuItem>
          </>
        )}

        <VersionHistory />
      </>
    )
  );
};

PopoverContent.propTypes = {
  openMoveDocumentModal: PropTypes.func.isRequired,
  disabledMoveDocument: PropTypes.bool,
  menuItemKey: PropTypes.string,
};

export default PopoverContent;
