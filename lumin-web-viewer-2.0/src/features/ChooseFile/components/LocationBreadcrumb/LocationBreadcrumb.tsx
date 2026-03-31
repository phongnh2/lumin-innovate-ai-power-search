import { PlainTooltip, Breadcrumb, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { useChooseFileContext } from 'features/ChooseFile/hooks';
import { BreadcrumbData } from 'features/ChooseFile/hooks/useHandleBreadcrumb';
import { ActionTypes } from 'features/ChooseFile/reducers/ChooseFile.reducer';

import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';

import styles from './LocationBreadcrumb.module.scss';

const LocationBreadcrumb = () => {
  const { t } = useTranslation();

  const { state: chooseFileState, dispatch } = useChooseFileContext();
  const { breadcrumbData } = chooseFileState;

  const { onKeyDown } = useKeyboardAccessibility();

  const breadcrumbItems = useMemo(
    () => [
      {
        _id: 'home',
        name: t('common.home'),
        onClick: () =>
          dispatch({
            type: ActionTypes.SET_BREADCRUMB_DATA,
            payload: {
              breadcrumbData: [],
            },
          }),
      },
      ...breadcrumbData.map((item) => ({
        ...item,
        onClick: () => {
          dispatch({
            type: ActionTypes.REMOVE_BREADCRUMB_ITEM,
            payload: {
              item,
            },
          });
        },
      })),
    ],
    [breadcrumbData, dispatch]
  );

  const renderItem = useCallback((item: BreadcrumbData, itemProps: { key: number; className: string }) => {
    const { key, ...otherItemProps } = itemProps;
    return (
      <PlainTooltip key={key} content={item.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY} position="top">
        <div
          {...otherItemProps}
          role="button"
          tabIndex={0}
          data-cy="choose_a_file_to_edit_breadcrumb"
          onClick={item.onClick}
          onKeyDown={onKeyDown}
        >
          <p className={styles.itemText}>{item.name}</p>
        </div>
      </PlainTooltip>
    );
  }, []);

  return (
    <div className={styles.breadcrumbWrapper}>
      <p className={styles.locationText}>{t('common.location')}: </p>
      <Breadcrumb
        items={breadcrumbItems}
        separatorMargin="var(--kiwi-spacing-0-75)"
        separator={<Icomoon type="ph-caret-right" />}
        variant="link"
        renderItem={renderItem}
        classNames={{
          root: styles.breadcrumb,
        }}
        itemClassNames={{
          previous: styles.itemWrapper,
          current: styles.currentBreadcrumb,
        }}
        maxItemsDisplay={4}
        menuIndex={0}
        menuTargetProps={{
          classNames: {
            root: styles.menuTarget,
          },
        }}
        menuProps={{
          position: 'bottom-start',
          classNames: {
            dropdown: styles.dropdown,
          },
        }}
        menuItemProps={{
          classNames: {
            itemLabel: styles.menuItem,
          },
        }}
      />
    </div>
  );
};

export default LocationBreadcrumb;
