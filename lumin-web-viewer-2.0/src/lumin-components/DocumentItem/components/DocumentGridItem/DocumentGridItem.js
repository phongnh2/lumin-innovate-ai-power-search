import PropTypes from 'prop-types';
import React from 'react';
import { useMedia } from 'react-use';

import { DocumentListRendererContext } from 'lumin-components/DocumentList/Context';
import DownloadProgress from 'lumin-components/DownloadProgress';
import FavoriteIcon from 'lumin-components/FavoriteIcon';
import Icomoon from 'lumin-components/Icomoon';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import Tooltip from 'lumin-components/Shared/Tooltip';
import SvgElement from 'lumin-components/SvgElement';

import { useDoubleTap } from 'hooks';

import { canEnableOffline } from 'helpers/pwa';

import { file, getFileService, avatar as avatarUtils } from 'utils';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { Breakpoints, Colors } from 'constants/styles';

import DocumentActionButton from '../DocumentActionButton';
import DocumentName from '../DocumentName';
import DocumentOwnerName from '../DocumentOwnerName';
import DocumentThumbnail from '../DocumentThumbnail';

import * as GridItemStyled from './DocumentGridItem.styled';

const OFFLINE_STATUS_DATA = {
  [DOCUMENT_OFFLINE_STATUS.AVAILABLE]: {
    tooltip: 'Available Offline',
    component: <Icomoon className="available-offline" size={16} color={Colors.NEUTRAL_60} />,
  },
  [DOCUMENT_OFFLINE_STATUS.DOWNLOADING]: {
    tooltip: 'Downloading...',
    component: <DownloadProgress size={16} />,
  },
};

function DocumentGridItem({
  document,
  buttonMore,
  onOpenDocument,
  storageLogo,
  isSelected,
  isDisabled,
  onCheckboxChange,
  dragRef,
}) {
  const {
    name,
    lastAccess,
    thumbnail,
    ownerName,
    ownerAvatarRemoteId,
    newUpload,
    isOverTimeLimit,
    offlineStatus,
    service,
  } = document;
  const isMobile = useMedia(`(max-width: ${Breakpoints.md - 1}px)`);
  const documentName = file.getFilenameWithoutExtension(name);
  const storageLogoSize = isMobile ? 15 : 18;
  const defaultThumbnailWidth = isMobile ? 28 : 32;
  const defaultThumbnailHeight = isMobile ? 37 : 43;
  const { tooltip, component } = OFFLINE_STATUS_DATA[offlineStatus] || {};
  const isSystemFile = service === STORAGE_TYPE.SYSTEM;

  const handleTouchEnd = useDoubleTap(onOpenDocument);

  const renderOfflineStatus = () => (component && (
    <Tooltip
      title={tooltip}
      PopperProps={{ disablePortal: true }}
      tooltipStyle={{ zIndex: 4 }}
      placement="bottom"
    >
      <div style={{ display: 'flex' }}>
        {component}
      </div>
    </Tooltip>
  ));

  return (
    <GridItemStyled.Container
      ref={dragRef}
      $disabledSelection={isDisabled.selection}
      $disabledActions={isDisabled.actions}
      $selected={isSelected}
      $isDragging={isDisabled.drag}
    >
      <DocumentListRendererContext.Consumer>
        {({ selectDocMode }) => (
          <GridItemStyled.CheckboxWrapper
            $display={selectDocMode}
            $selected={isSelected}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <GridItemStyled.CustomCheckbox
              type="checkbox"
              checked={isSelected}
              onChange={onCheckboxChange}
              disableRipple
              disabled={isDisabled.selection}
            />
          </GridItemStyled.CheckboxWrapper>
        )}
      </DocumentListRendererContext.Consumer>
      <div
        onDoubleClick={onOpenDocument}
        onTouchEnd={handleTouchEnd}
        onClick={(event) => {
          // It prevents checking the document when the user clicks view options per document
          const element = event.target.closest(`[data-button-more-id="${document._id}"]`);
          if (!element) {
            onOpenDocument();
          }
        }}
        role="button"
        tabIndex="0"
      >
        <GridItemStyled.ThumbnailContainer>
          <DocumentListRendererContext.Consumer>
            {({ selectDocMode }) => (
              <GridItemStyled.Overlay $display={isSelected || selectDocMode} />
            )}
          </DocumentListRendererContext.Consumer>
          {newUpload && <GridItemStyled.DocumentStatus />}
          {isOverTimeLimit && (
            <GridItemStyled.ExpiredTag>
              Expired
            </GridItemStyled.ExpiredTag>
          )}

          <GridItemStyled.ThumbnailWrapper>
            <DocumentThumbnail
              src={getFileService.getThumbnailUrl(thumbnail)}
              altText={documentName}
              defaultHeight={defaultThumbnailHeight}
              defaultWidth={defaultThumbnailWidth}
            />
          </GridItemStyled.ThumbnailWrapper>
        </GridItemStyled.ThumbnailContainer>

        <GridItemStyled.DocumentNameWrapper>
          <DocumentName name={documentName} disabled={isDisabled.selection} openDocument={onOpenDocument} />
        </GridItemStyled.DocumentNameWrapper>

        <GridItemStyled.TopInfoContainer>
          <SvgElement
            content={storageLogo}
            width={storageLogoSize}
            height={storageLogoSize}
          />

          <GridItemStyled.LastAccessLabel>{lastAccess}</GridItemStyled.LastAccessLabel>

          {
            canEnableOffline() && (
              <GridItemStyled.OfflineStatusWrapper>
                {renderOfflineStatus()}
              </GridItemStyled.OfflineStatusWrapper>
            )
          }

          {
            !isSystemFile && (
              <GridItemStyled.FavoriteWrapper>
                <FavoriteIcon document={document} disabled={isDisabled.actions} />
              </GridItemStyled.FavoriteWrapper>
            )
          }
        </GridItemStyled.TopInfoContainer>

        <GridItemStyled.BottomInfoContainer>
          <MaterialAvatar
            size={isMobile ? 20 : 24}
            src={avatarUtils.getAvatar(ownerAvatarRemoteId)}
            secondary
          >
            {avatarUtils.getTextAvatar(ownerName)}
          </MaterialAvatar>
          <DocumentOwnerName disabled={isDisabled.selection} ownerName={ownerName} />
          <DocumentActionButton disabled={isDisabled.actions}>
            {buttonMore}
          </DocumentActionButton>
        </GridItemStyled.BottomInfoContainer>
      </div>
    </GridItemStyled.Container>
  );
}

DocumentGridItem.propTypes = {
  document: PropTypes.object,
  buttonMore: PropTypes.node.isRequired,
  onOpenDocument: PropTypes.func,
  isSelected: PropTypes.bool,
  isDisabled: PropTypes.object.isRequired,
  dragRef: PropTypes.func.isRequired,
  storageLogo: PropTypes.string.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
};

DocumentGridItem.defaultProps = {
  document: {},
  onOpenDocument: () => {},
  isSelected: false,
};

export default DocumentGridItem;
