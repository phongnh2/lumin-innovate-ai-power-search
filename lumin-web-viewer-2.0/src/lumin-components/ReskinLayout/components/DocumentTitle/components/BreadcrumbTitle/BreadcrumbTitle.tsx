import classNames from 'classnames';
import { Breadcrumb, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useGetParentUrl } from 'screens/DocumentFolder/hooks';

import {
  useGetCurrentOrganization,
  useTranslation,
  useGetFolderType,
  useGetCurrentTeam,
  useNetworkStatus,
} from 'hooks';
import { useLgMatch } from 'hooks/useDesktopMatch';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { folderType } from 'constants/documentConstants';
import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';
import { ITeam } from 'interfaces/team/team.interface';

import LastFolderBreadcrumbItem from './components/LastFolderBreadcrumbItem';
import { BreadcrumbData } from '../../interface';

import styles from './BreadcrumbTitle.module.scss';

type BreadcrumbTitleProps = {
  folder: IFolder;
};

const BreadcrumbTitle = ({ folder }: BreadcrumbTitleProps) => {
  const { t } = useTranslation();

  const rootParentUrl = useGetParentUrl({ folder });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentOrg = useGetCurrentOrganization();
  const currentFolderType = useGetFolderType();
  const { isOffline } = useNetworkStatus();
  const { isVisible } = useChatbotStore();
  const navigate = useNavigate();
  const isLgMatch = useLgMatch();

  const { onKeyDown } = useKeyboardAccessibility();

  const titleMapping = useMemo(
    () => ({
      [folderType.INDIVIDUAL]: t('pageTitle.myDocuments'),
      [folderType.TEAMS]: currentTeam?.name || '',
      [folderType.ORGANIZATION]: `All ${currentOrg?.name}` || '',
      [folderType.STARRED]: t('pageTitle.starred'),
      [folderType.SHARED]: t('sidebar.sharedWithMe'),
    }),
    [currentTeam, currentOrg]
  );

  const breadcrumbData: BreadcrumbData[] = useMemo(
    () =>
      !folder
        ? [
            {
              title: titleMapping[currentFolderType],
              url: '',
              root: true,
            },
          ]
        : [
            {
              title: titleMapping[currentFolderType],
              url: rootParentUrl,
              root: true,
              onClick: () => {
                navigate(rootParentUrl);
              },
            },
            ...folder.breadcrumbs.map((breadcrumb) => ({
              title: breadcrumb.name,
              url: `${rootParentUrl}/folder/${breadcrumb._id}`,
              onClick: () => {
                navigate(`${rootParentUrl}/folder/${breadcrumb._id}`);
              },
            })),
            {
              title: folder.name,
              url: '',
              isCurrentFolder: true,
            },
          ],
    [titleMapping, currentFolderType, rootParentUrl, folder]
  );

  const renderItem = useCallback(
    (item: BreadcrumbData, itemProps: Record<string, unknown>) => {
      if (!item.title) return null;

      if (item.url) {
        return (
          <PlainTooltip
            content={item.title}
            maw={TOOLTIP_MAX_WIDTH}
            openDelay={TOOLTIP_OPEN_DELAY}
            position="top"
            disabled={isOffline}
            key={item.title}
          >
            <Link
              className={classNames(itemProps.className as string, styles.itemWrapper, {
                [styles.disabled]: isOffline,
              })}
              to={item.url}
            >
              <span className={styles.item}>{item.title}</span>
            </Link>
          </PlainTooltip>
        );
      }
      if (folder && item.isCurrentFolder) {
        return <LastFolderBreadcrumbItem folder={folder} item={item} itemProps={itemProps} />;
      }
      return (
        <PlainTooltip
          content={item.title}
          maw={TOOLTIP_MAX_WIDTH}
          openDelay={TOOLTIP_OPEN_DELAY}
          position="top"
          key={item.title}
        >
          <div
            {...itemProps}
            role="button"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className={classNames(itemProps.className as string, styles.itemWrapper)}
          >
            <span className={styles.item}>{item.title}</span>
          </div>
        </PlainTooltip>
      );
    },
    [isOffline, folder]
  );

  const renderMenuItem = useCallback(
    (item: BreadcrumbData, itemProps: Record<string, unknown>) => {
      if (!item.title) return null;

      return (
        <PlainTooltip
          content={item.title}
          maw={TOOLTIP_MAX_WIDTH}
          openDelay={TOOLTIP_OPEN_DELAY}
          position="top"
          disabled={isOffline}
          key={item.title}
        >
          <div>
            <Link
              className={classNames(itemProps.className as string, styles.itemWrapper, styles.menuItemContainer, {
                [styles.disabled]: isOffline,
              })}
              to={item.url}
            >
              <div className={styles.iconWrapper}>
                {item.root ? (
                  <Icomoon size="md" type="ph-file-text-fill" />
                ) : (
                  <Icomoon size="md" type="folder-shape-md" />
                )}
              </div>
              <span className={styles.item}>{item.title}</span>
            </Link>
          </div>
        </PlainTooltip>
      );
    },
    [isOffline]
  );

  return (
    <Breadcrumb
      items={breadcrumbData}
      renderItem={renderItem}
      classNames={{
        root: styles.breadcrumbWrapper,
      }}
      data-chatbot-opened={isVisible}
      disabled={isOffline}
      menuIndex={0}
      menuTargetProps={{
        size: 'lg',
        icon: 'dots-lg',
        classNames: {
          inner: styles.iconButtonInner,
          root: styles.iconButtonRoot,
        },
      }}
      menuProps={{
        position: 'bottom-start',
        styles: {
          dropdown: {
            width: 220,
          },
        },
      }}
      renderMenuItem={renderMenuItem}
      itemClassNames={{
        current: breadcrumbData[breadcrumbData.length - 1]?.isCurrentFolder ? styles.currentBreadcrumb : '',
      }}
      maxItemsDisplay={isVisible && !isLgMatch ? 2 : undefined}
      separatorMargin={isVisible && !isLgMatch ? 'var(--kiwi-spacing-0)' : undefined}
    />
  );
};

export default BreadcrumbTitle;
