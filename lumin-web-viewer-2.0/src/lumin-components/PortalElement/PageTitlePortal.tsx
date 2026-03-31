import React from 'react';

import PortalElement from './PortalElement';
import { PAGE_TITLE_PORTAL } from './portalTargetElements';

type PageTitleElementProps = {
  children: React.ReactNode;
};

type PageTitlePortalProps = {
  type?: keyof React.ReactHTML;
};

const PageTitleElement = (props: PageTitleElementProps) => (
  <PortalElement target={PAGE_TITLE_PORTAL}>{props.children}</PortalElement>
);

const PageTitlePortal = (props: PageTitlePortalProps) =>
  React.createElement(props.type || 'div', { 'data-portal-target': PAGE_TITLE_PORTAL });

export default {
  Portal: React.memo(PageTitlePortal),
  Element: React.memo(PageTitleElement),
};
