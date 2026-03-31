import React from 'react';
import { createPortal } from 'react-dom';

import { DATA_PORTAL_ID } from 'constants/lumin-common';

export function createViewerPortal(children, dataId = DATA_PORTAL_ID) {
  const element = document.querySelector(`[data-portal-id="${dataId}"]`);
  return createPortal(children, element);
}

export default () => <div data-portal-id={DATA_PORTAL_ID} />;
