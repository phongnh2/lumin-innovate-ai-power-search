/* eslint-disable class-methods-use-this */
import React, { MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';

import OutlineShortcutButton from '../components/OutlineShortcutButton';

class OutlineDrawerUtil {
  private createOutlineContainer(page: number) {
    const outlineIconContainerElement = document.createElement('div');
    outlineIconContainerElement.id = `outlineIconContainer-${page}`;
    outlineIconContainerElement.className = 'outlineIconContainer';
    outlineIconContainerElement.style.position = 'absolute';
    outlineIconContainerElement.style.top = '-8px';
    outlineIconContainerElement.style.right = '0';
    outlineIconContainerElement.style.zIndex = '50';
    outlineIconContainerElement.style.cursor = 'pointer';
    return outlineIconContainerElement;
  }

  private onIconClick = (event: MouseEvent, { page }: { page: number }) => {
    fireEvent(CUSTOM_EVENT.OPEN_OUTLINE_PANEL, { pageNumber: page });
  };

  private createOutlineIcon(page: number) {
    return <OutlineShortcutButton onClick={(event: MouseEvent) => this.onIconClick(event, { page })} />;
  }

  private appendOutlineContainer = (page: number) => {
    const pageContainer = document.getElementById(`pageContainer${page}`);
    const currentOutlineIconContainer = document.getElementById(`outlineIconContainer-${page}`);
    if (!pageContainer || currentOutlineIconContainer) {
      return;
    }
    const outlineIconContainer = this.createOutlineContainer(page);
    pageContainer.appendChild(outlineIconContainer);
    const outlineIcon = this.createOutlineIcon(page);
    createRoot(outlineIconContainer).render(outlineIcon);
  };

  drawOutlineShortcut = (page: number) => {
    this.appendOutlineContainer(page);
  };
}

export default new OutlineDrawerUtil();
