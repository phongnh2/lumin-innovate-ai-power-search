import { Text, Icomoon, Badge, BadgeProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import NewBadge from 'features/PromoteTemplates/components/NewBadge';
import usePromoteTemplates from 'features/PromoteTemplates/hooks/usePromoteTemplates';

import { ActiveMenuItemTypes } from '../../LeftSidebarDrawer.constants';

import styles from './NavigationItem.module.scss';

type BetaVersionProps = {
  content: string;
  size: BadgeProps['size'];
  variant: BadgeProps['variant'];
};

export type NavigationItemProps = React.JSX.IntrinsicElements['div'] & {
  icon: string;
  title: string;
  isActive?: boolean;
  activeType?: ActiveMenuItemTypes;
  onClick?: () => void;
  expandable?: boolean;
  betaVersion?: BetaVersionProps;
  newFeatureBadge?: boolean;
};

const NavigationItem = ({
  icon,
  title,
  expandable = false,
  isActive = false,
  activeType = ActiveMenuItemTypes.Default,
  onClick,
  betaVersion,
  newFeatureBadge,
  ...otherProps
}: NavigationItemProps) => {
  const { onKeyDown } = useKeyboardAccessibility();
  const { hasNotVisitedTemplateList } = usePromoteTemplates();
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.navItem}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-active={isActive ? activeType : ''}
      {...otherProps}
    >
      {newFeatureBadge && hasNotVisitedTemplateList && (
        <div className={styles.newFeatureBadgeContainer}>
          <NewBadge size="sm" />
        </div>
      )}
      <Icomoon size="md" type={icon} color="var(--kiwi-colors-surface-on-surface)" />
      <div className={styles.titleContainer}>
        <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface)">
          {title}
        </Text>
        {betaVersion && (
          <Badge size={betaVersion.size} variant={betaVersion.variant}>
            {betaVersion.content}
          </Badge>
        )}
      </div>
      {expandable && <Icomoon size="md" type="chevron-right-lg" color="var(--kiwi-colors-surface-on-surface)" />}
    </div>
  );
};

export default NavigationItem;
