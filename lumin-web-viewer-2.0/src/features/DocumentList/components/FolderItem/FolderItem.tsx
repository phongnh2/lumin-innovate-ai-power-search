import classNames from 'classnames';
import React, { useMemo } from 'react';

import { useGetCurrentUser } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { ExtendedFolderModalProps } from 'features/DocumentList/HOC/withFolderModal';
import useFolderActions from 'features/DocumentList/hooks/useFolderActions';
import { FolderActionsType } from 'features/DocumentList/types';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { IFolder } from 'interfaces/folder/folder.interface';

import styles from './FolderItem.module.scss';

type FolderItemChildProps = {
  renderHiddenElement: (visibleElement: React.ReactNode, hiddenElement: React.ReactNode) => React.ReactNode;
  renderMoreActionsElement: (element: React.ReactNode) => React.ReactNode;
  actions: FolderActionsType;
  isStarred: boolean;
};

type FolderItemClassNames = {
  container?: string;
};

export interface FolderItemProps {
  folder: IFolder;
  children: (props: FolderItemChildProps) => React.ReactNode;
  containerScrollRef?: React.MutableRefObject<HTMLElement>;
  isActivatedMoreActions?: boolean;
  classNames?: FolderItemClassNames;
  openFolderModal: ExtendedFolderModalProps['openFolderModal'];
}

const FolderItem = (props: FolderItemProps) => {
  const { folder, children, isActivatedMoreActions, classNames: extraClassNames, openFolderModal } = props;
  const { isVisible } = useChatbotStore();

  const currentUser = useGetCurrentUser();

  const { onKeyDown } = useKeyboardAccessibility();

  const renderHiddenElement = (visibleElement: React.ReactNode, hiddenElement: React.ReactNode) => (
    <div className={styles.quickActionsWrapper}>
      <div className={styles.visibleWrapper}>{visibleElement}</div>
      <div className={styles.hiddenWrapper}>{hiddenElement}</div>
    </div>
  );

  const renderMoreActionsElement = (element: React.ReactNode) => (
    <div
      className={classNames(styles.moreActionsWrapper, { [styles.activated]: isActivatedMoreActions })}
      data-button-more-id={folder._id}
    >
      {element}
    </div>
  );

  // [START] star info
  const isStarred = useMemo(
    () => folder.listUserStar.includes(currentUser._id),
    [folder.listUserStar, currentUser._id]
  );
  // [END]

  const { actions } = useFolderActions({
    folder,
    openFolderModal,
  });

  return (
    <div
      className={classNames(styles.container, extraClassNames?.container, {
        [styles.selected]: isActivatedMoreActions,
      })}
      data-chatbot-opened={isVisible}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={actions.open}
    >
      {children({ renderHiddenElement, renderMoreActionsElement, actions, isStarred })}
    </div>
  );
};

export default FolderItem;
