import React from 'react';

import { SideBarIcon } from '@new-ui/components/LuminLeftSideBar/interfaces';

export type NavigationButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: SideBarIcon;
  label?: string;
  value?: string;
  isActive?: boolean;
  eventTrackingName?: string;
  tooltipData?: Record<string, unknown>;
  iconSize?: number;
  hideLabelOnSmallScreen?: boolean;
  shouldShowPremiumIcon?: boolean;
  dataElement?: string;
  isHovered?: boolean;
  isColorIcon?: boolean;
  isHighlightIcon?: boolean;
};
