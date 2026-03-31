import classNames from 'classnames';
import { Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import FolderMoreActionsButton from 'features/DocumentList/components/FolderMoreActionsButton/FolderMoreActionsButton';
import withFolderModal, { FolderSettingModalType } from 'features/DocumentList/HOC/withFolderModal';
import useFolderActions from 'features/DocumentList/hooks/useFolderActions';

import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

import { BreadcrumbData } from '../../../interface';
import styles from '../BreadcrumbTitle.module.scss';

type LastFolderBreadcrumbItemProps = {
  folder: IFolder;
  openFolderModal: React.Dispatch<React.SetStateAction<FolderSettingModalType>>;
  item: BreadcrumbData;
  itemProps: Record<string, unknown>;
};

const LastFolderBreadcrumbItem = ({ folder, openFolderModal, itemProps, item }: LastFolderBreadcrumbItemProps) => {
  const { actions } = useFolderActions({
    folder,
    openFolderModal,
  });
  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <PlainTooltip
      content={item.title}
      maw={TOOLTIP_MAX_WIDTH}
      openDelay={TOOLTIP_OPEN_DELAY}
      position="top"
      key={item.title}
    >
      <FolderMoreActionsButton
        folder={folder}
        containerScrollRef={null}
        actions={actions}
        menuProps={{ styles: { dropdown: { width: '250px' } }, position: 'bottom-start' }}
      >
        <div
          {...itemProps}
          role="button"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className={classNames(
            itemProps.className as string,
            styles.itemWrapper,
            styles.folderWithMoreActionItemContainer
          )}
        >
          <span className={styles.item}>{item.title}</span>
          <Icomoon size="md" type="caret-down-filled-md" />
        </div>
      </FolderMoreActionsButton>
    </PlainTooltip>
  );
};

export default withFolderModal(LastFolderBreadcrumbItem);
