import { NavigationItemProps } from './components/NavigationItem';
import { NavigationTypes, SubMenuTypes, ModalTypes } from './LeftSidebarDrawer.constants';

export type NavigationItems = {
  id: string;
  name?: string;
  title: string;
  icon: string;
  show: boolean;
  type: NavigationTypes;
  eventType?: string;
  extraProps: LinkProps | SubMenuProps | ToggleProps;
  newFeatureBadge?: boolean;
};

export type LinkProps = {
  url: string;
  openInNewTab?: boolean;
  betaVersion?: NavigationItemProps['betaVersion'];
};

export type SubMenuProps = {
  type: SubMenuTypes;
};

export type ToggleProps = {
  type: ModalTypes;
};
