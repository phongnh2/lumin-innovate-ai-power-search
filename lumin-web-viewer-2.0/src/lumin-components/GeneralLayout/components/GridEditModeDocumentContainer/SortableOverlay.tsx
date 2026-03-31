import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import type { DropAnimation, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { createPortal } from 'react-dom';

interface SortableOverlayProps {
  children: React.ReactNode;
  activeId: UniqueIdentifier;
  portalOverlay?: HTMLElement | null;
}

export const DROP_OPACITY = 0.4;

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { transform: CSS.Transform.toString(transform.initial) },
      {
        transform: CSS.Transform.toString({
          scaleX: 1,
          scaleY: 1,
          x: transform.final.x,
          y: transform.final.y,
        }),
      },
    ];
  },
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: DROP_OPACITY.toString(),
        background: 'transparent',
      },
    },
  }),
};

export function SortableOverlay({ activeId, children, portalOverlay }: SortableOverlayProps) {
  if (!portalOverlay) {
    return null;
  }

  const scrollRect = portalOverlay.getBoundingClientRect();

  return createPortal(
    <DragOverlay
      modifiers={[
        ({ transform }) => ({
          x: transform.x - scrollRect.left + portalOverlay.scrollLeft,
          y: transform.y - scrollRect.top + portalOverlay.scrollTop,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
        }),
      ]}
      dropAnimation={dropAnimationConfig}
    >
      {activeId != null ? children : null}
    </DragOverlay>,
    portalOverlay
  );
}