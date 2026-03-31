import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import { useGetActiveStateMenuItem, useGetNavigationItems } from '../../hooks';
import { ModalTypes, SubMenuTypes, NavigationTypes } from '../../LeftSidebarDrawer.constants';
import { LinkProps, SubMenuProps, ToggleProps } from '../../LeftSidebarDrawer.types';
import { NavigationItem } from '../NavigationItem';

import styles from './NavigationItems.module.scss';

type NavigationItemsProps = {
  toggleModalType: (type: ModalTypes) => void;
  toggleSubMenu: (type: SubMenuTypes) => void;
};

const NavigationItems = ({ toggleModalType, toggleSubMenu }: NavigationItemsProps) => {
  const navigationItems = useGetNavigationItems();

  const { getIsActiveValue, getActiveTypeValue } = useGetActiveStateMenuItem();

  const renderNavigationItems = useCallback(
    () =>
      navigationItems.map((item) => {
        const { id, name, type: navType, eventType, show, title, icon, extraProps, newFeatureBadge } = item;

        if (!show) return null;

        switch (navType) {
          case NavigationTypes.Link: {
            const { url, openInNewTab, betaVersion } = extraProps as LinkProps;
            return (
              <NavLink
                tabIndex={-1}
                key={id}
                data-cy={id}
                data-lumin-btn-name={name}
                data-lumin-btn-event-type={eventType}
                to={url}
                target={openInNewTab ? '_blank' : '_self'}
              >
                {({ isActive }) => (
                  <NavigationItem key={title} icon={icon} title={title} isActive={isActive} betaVersion={betaVersion} />
                )}
              </NavLink>
            );
          }
          case NavigationTypes.SubMenu: {
            const { type } = extraProps as SubMenuProps;
            const isActive = getIsActiveValue(type);
            const activeType = getActiveTypeValue(type);
            return (
              <NavigationItem
                expandable
                key={id}
                data-cy={id}
                data-lumin-btn-name={name}
                data-lumin-btn-event-type={eventType}
                icon={icon}
                title={title}
                isActive={isActive}
                activeType={activeType}
                onClick={() => toggleSubMenu(type)}
                newFeatureBadge={newFeatureBadge}
              />
            );
          }
          case NavigationTypes.Toggle: {
            const { type } = extraProps as ToggleProps;
            return (
              <NavigationItem
                key={id}
                data-cy={id}
                data-lumin-btn-name={name}
                data-lumin-btn-event-type={eventType}
                icon={icon}
                title={title}
                onClick={() => toggleModalType(type)}
              />
            );
          }
          default:
            return null;
        }
      }),
    [navigationItems, getIsActiveValue, getActiveTypeValue, toggleModalType, toggleSubMenu]
  );

  return <div className={styles.container}>{renderNavigationItems()}</div>;
};

export default NavigationItems;
