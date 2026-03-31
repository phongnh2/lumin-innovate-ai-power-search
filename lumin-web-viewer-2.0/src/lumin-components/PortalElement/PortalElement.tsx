import React from 'react';
import { createPortal } from 'react-dom';

type PortalElementProps = {
  children: React.ReactNode;
  target: string;
};

function PortalElement({ children, target }: PortalElementProps) {
  const container = document.querySelector(`[data-portal-target=${target}]`);
  return container && createPortal(children, container);
}

export default React.memo(PortalElement);
