/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import classNames from 'classnames';
import { Checkbox, TextSize, TextType, Chip, PlainTooltip, ButtonSize } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo, useState } from 'react';

import { DocumentListRendererContext } from 'luminComponents/DocumentList/Context';
import StopPropagation from 'luminComponents/StopPropagation';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useDoubleTap, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { file, getFileService } from 'utils';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentThumbnail } from './components';
import { DocumentItemStar } from '../DocumentItemStar';
import { TextField } from '../DocumentListItem/components';

import styles from './DocumentGridItem.module.scss';

type DocumentGridItemProps = {
  document: IDocumentBase & { newUpload?: boolean };
  isSelected: boolean;
  isDisabled: {
    selection: boolean;
    actions: boolean;
    open?: boolean;
    drag: boolean;
  };
  dragRef: React.MutableRefObject<HTMLDivElement>;
  storageLogo: string;
  isStarred: boolean;
  onOpenDocument: () => void;
  onCheckboxChange: () => void;
  renderMenuActions?: ({
    openMenu,
    setOpenMenu,
  }: {
    openMenu: boolean;
    setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
  onShareItemClick: () => void;
};

const DocumentGridItem = ({
  document,
  onOpenDocument,
  isSelected,
  isDisabled,
  onCheckboxChange,
  dragRef,
  isStarred,
  renderMenuActions,
}: DocumentGridItemProps) => {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState(false);

  const { selectDocMode } = useContext(DocumentListRendererContext);
  const { folderDraggingOver } = useContext(withDropDocPopup.DropDocumentPopupContext);

  const handleTouchEnd = useDoubleTap(onOpenDocument);

  const { onKeyDown } = useKeyboardAccessibility();

  const { name, newUpload, thumbnail, isOverTimeLimit } = document;

  const documentName = file.getFilenameWithoutExtension(name);

  const handleOpenDocument = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const elementMore = target.closest(`[data-button-more-id="${document._id}"]`);
    const elementStar = target.closest(`[data-button-star-id="${document._id}"]`);
    const menuItem = target.closest(`[data-menu-item="true"]`);
    if (!elementMore && !elementStar && !menuItem) {
      onOpenDocument();
    }
  };

  const containerClassName = useMemo(
    () =>
      classNames(styles.container, {
        [styles.containerSelected]: isSelected,
        [styles.containerDragging]: isDisabled.drag,
        [styles.disabled]: folderDraggingOver,
        [styles.disabledSelection]: isDisabled.selection,
      }),
    [isDisabled.drag, isSelected, folderDraggingOver, isDisabled.selection]
  );

  const thumbnailSrc = useMemo(() => getFileService.getThumbnailUrl(thumbnail), [thumbnail]);

  return (
    <div ref={dragRef} className={containerClassName}>
      <div className={classNames(styles.checkboxWrapper, { [styles.displayCheckboxWrapper]: selectDocMode })}>
        <Checkbox
          size="md"
          checked={isSelected}
          onChange={onCheckboxChange}
          disabled={isDisabled.selection}
          borderColor="var(--kiwi-colors-surface-outline)"
        />
      </div>
      <div
        data-cy="document_item"
        onDoubleClick={handleOpenDocument}
        onTouchEnd={handleTouchEnd}
        onClick={handleOpenDocument}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className={styles.thumbnailContainer}>
          <div className={classNames(styles.overlay, { [styles.displayOverlay]: selectDocMode })} />
          {newUpload && <div className={styles.documentStatus} />}
          <div className={styles.thumbnailWrapper}>
            {isOverTimeLimit && (
              <div className={styles.expiredTag}>
                <Chip label={t('documentPage.expired')} variant="light" size="sm" colorType="grey" />
              </div>
            )}
            <DocumentThumbnail altText={documentName} src={thumbnailSrc} />
          </div>
        </div>
        <div className={styles.docInfoWrapper}>
          <div className={styles.docInfo}>
            <TextField
              value={documentName}
              disabled={isDisabled.selection || isDisabled.drag}
              type={TextType.body}
              size={TextSize.md}
              tooltip
              color="var(--kiwi-colors-surface-on-surface)"
            />
          </div>
          <div className={styles.toolsWrapper}>
            <DocumentItemStar
              document={document}
              isStarred={isStarred}
              disabled={isDisabled.actions}
              size={ButtonSize.md}
            />
            <PlainTooltip content={t('documentPage.moreActions')} disabled={openMenu}>
              <StopPropagation
                role="presentation"
                data-button-more-id={document._id}
                className={classNames(styles.buttonMoreWrapper, {
                  [styles.displayBlock]: openMenu || isSelected,
                })}
              >
                {renderMenuActions({ openMenu, setOpenMenu })}
              </StopPropagation>
            </PlainTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGridItem;
