import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import { DocumentSearchContext } from 'lumin-components/Document/context';
import { useGetFolderUrl } from 'lumin-components/DocumentItem/hooks';
import { DocumentListRendererContext } from 'lumin-components/DocumentList/Context';
import DownloadProgress from 'lumin-components/DownloadProgress';
import FavoriteIcon from 'lumin-components/FavoriteIcon';
import Tooltip from 'lumin-components/Shared/Tooltip';
import SvgElement from 'luminComponents/SvgElement';

import { useTabletMatch, useFolderPathMatch, useTranslation, useDoubleTap } from 'hooks';

import { canEnableOffline } from 'helpers/pwa';

import {
  getFileService,
} from 'utils';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { StorageLogo, STORAGE_TYPE } from 'constants/lumin-common';

import * as Styled from '../../DocumentItem.styled';
import DocumentName from '../DocumentName';
import DocumentOwnerName from '../DocumentOwnerName';
import DocumentThumbnail from '../DocumentThumbnail';

import * as ListItemStyled from './DocumentListItem.styled';

const propTypes = {
  document: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.shape({
    selection: PropTypes.bool.isRequired,
    actions: PropTypes.bool.isRequired,
    open: PropTypes.bool,
    drag: PropTypes.bool.isRequired,
  }).isRequired,
  dragRef: PropTypes.func.isRequired,
  storageLogo: PropTypes.oneOf(Object.values(StorageLogo)).isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  buttonMore: PropTypes.node.isRequired,
  onOpenDocument: PropTypes.func.isRequired,
};

const DocumentListItem = (props) => {
  const {
    document,
    buttonMore,
    storageLogo,
    isSelected,
    isDisabled,
    onOpenDocument,
    onCheckboxChange,
    dragRef,
  } = props;

  const {
    name,
    lastAccess,
    thumbnail,
    ownerName,
    newUpload,
    isOverTimeLimit,
    folderData,
    documentType,
    clientId,
    offlineStatus,
    service,
  } = document;
  const { t } = useTranslation();
  const { _id: folderId, name: folderName, canOpen } = folderData || {};
  const isInFolderPage = useFolderPathMatch();
  const isTabletMatch = useTabletMatch();
  const folderUrl = useGetFolderUrl({ folderId, documentType, clientId });

  const documentName = name.substring(0, name.lastIndexOf('.')) || name;

  const isOffline = useSelector(selectors.isOffline);
  const isSystemFile = service === STORAGE_TYPE.SYSTEM;

  const handleTouchEnd = useDoubleTap(onOpenDocument);

  const documentNameMemo = useMemo(() => (
    <DocumentName
      disabled={isDisabled.selection || isDisabled.drag}
      name={documentName}
      openDocument={onOpenDocument}
    />
  ), [documentName, isDisabled.selection, onOpenDocument, isDisabled.drag]);

  const documentOwnerMemo = useMemo(
    () => <DocumentOwnerName disabled={isDisabled.selection || isDisabled.drag} ownerName={ownerName} />,
    [ownerName, isDisabled.selection, isDisabled.drag]
  );

  const isAvailableOffline = offlineStatus === DOCUMENT_OFFLINE_STATUS.AVAILABLE;

  const isDownloading = offlineStatus === DOCUMENT_OFFLINE_STATUS.DOWNLOADING;

  const displayFolderInfo = !isInFolderPage && folderId && canOpen;

  const displayDivider = displayFolderInfo && (isAvailableOffline || isDownloading) && !isOffline;

  const renderSearchedFolder = useCallback(() => displayFolderInfo && (
    <DocumentSearchContext.Consumer>
      {
        ({ isSearchView }) => isSearchView && (
          <Tooltip
            title={folderName}
            PopperProps={{ disablePortal: true }}
            tooltipStyle={{ zIndex: 2 }}
            placement="bottom-start"
          >
            <ListItemStyled.SearchedFolderText onClick={(e) => e.stopPropagation()}>
              in {' '}
              <Link to={folderUrl}>{folderName}</Link>
            </ListItemStyled.SearchedFolderText>
          </Tooltip>
        )
      }
    </DocumentSearchContext.Consumer>
  ), [canOpen, folderId, folderName, isInFolderPage]);

  const renderAdditionalInfo = () => (
    <ListItemStyled.AdditionalInfoWrapper>
      {isTabletMatch && renderSearchedFolder()}
      {displayDivider && <ListItemStyled.CustomDivider orientation="vertical" flexItem />}
      {canEnableOffline() && isAvailableOffline && (
        <ListItemStyled.OfflineTag>
          {t('documentPage.availableOffline')}
        </ListItemStyled.OfflineTag>
      )}
      {isDownloading && (
        <ListItemStyled.OfflineTag>
          <DownloadProgress />
          <span style={{ marginLeft: 4 }}>{t('documentPage.downloading')}</span>
        </ListItemStyled.OfflineTag>
      )}
    </ListItemStyled.AdditionalInfoWrapper>
  );

  return (
    <ListItemStyled.Container
      $disabledSelection={isDisabled.selection}
      $disabledActions={isDisabled.actions}
      $isDragging={isDisabled.drag}
    >
      <DocumentListRendererContext.Consumer>
        {({ selectDocMode }) => (
          <ListItemStyled.CheckboxWrapper
            $display={selectDocMode}
            $selected={isSelected}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <ListItemStyled.CustomCheckbox
              checked={isSelected}
              onChange={onCheckboxChange}
              disableRipple
              disabled={isDisabled.selection}
            />
          </ListItemStyled.CheckboxWrapper>
        )}
      </DocumentListRendererContext.Consumer>
      <ListItemStyled.Wrapper
        ref={dragRef}
        onDoubleClick={onOpenDocument}
        onTouchEnd={handleTouchEnd}
        onClick={(event) => {
          // It prevents checking the document when the user clicks view options per document
          const element = event.target.closest(`[data-button-more-id="${document._id}"]`);
          if (!element) {
            onOpenDocument();
          }
        }}
        $disabled={isDisabled.selection}
        $selected={isSelected}
      >
        <ListItemStyled.UploadInfoContainer>
          <ListItemStyled.ThumbnailContainer>
            {newUpload && (
              <Styled.DocumentStatus />
            )}
            <ListItemStyled.ThumbnailWrapper>
              <DocumentThumbnail
                src={getFileService.getThumbnailUrl(thumbnail)}
                altText={documentName}
              />
            </ListItemStyled.ThumbnailWrapper>
            {isOverTimeLimit && (
              <ListItemStyled.ExpiredTag>
                {t('documentPage.expired')}
              </ListItemStyled.ExpiredTag>
            )}
          </ListItemStyled.ThumbnailContainer>

          <ListItemStyled.CommonInfoContainer>
            <ListItemStyled.DocNameWrapper>
              {documentNameMemo}
              {renderAdditionalInfo()}
            </ListItemStyled.DocNameWrapper>

            {
              !isSystemFile && (
                <ListItemStyled.StarWrapper>
                  <FavoriteIcon document={document} disabled={isDisabled.actions} />
                </ListItemStyled.StarWrapper>
              )
            }

            <ListItemStyled.MobileNameWrapper>
              {renderSearchedFolder()}
              {documentOwnerMemo}
            </ListItemStyled.MobileNameWrapper>
          </ListItemStyled.CommonInfoContainer>
        </ListItemStyled.UploadInfoContainer>

        <ListItemStyled.NonMobileDescriptionWrapper>
          {documentOwnerMemo}
        </ListItemStyled.NonMobileDescriptionWrapper>

        <ListItemStyled.NonMobileDescriptionWrapper>
          <ListItemStyled.StorageWrapper>
            {storageLogo &&
              <SvgElement
                content={storageLogo}
                height={24}
              />
            }
          </ListItemStyled.StorageWrapper>
        </ListItemStyled.NonMobileDescriptionWrapper>

        <ListItemStyled.NonMobileDescriptionWrapper>
          <Styled.Text>{lastAccess}</Styled.Text>
        </ListItemStyled.NonMobileDescriptionWrapper>

        <ListItemStyled.ButtonMore disabled={isDisabled.actions}>
          {buttonMore}
        </ListItemStyled.ButtonMore>
      </ListItemStyled.Wrapper>
    </ListItemStyled.Container>
  );
};

DocumentListItem.propTypes = propTypes;

export default DocumentListItem;
