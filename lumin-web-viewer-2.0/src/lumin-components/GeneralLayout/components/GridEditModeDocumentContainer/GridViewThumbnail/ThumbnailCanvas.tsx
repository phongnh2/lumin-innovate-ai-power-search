import classNames from 'classnames';
import React, { useEffect } from 'react';
import { css } from 'styled-components';

import { ThumbnailCanvasProps } from '../types';

import * as Styled from './GridViewThumbnail.styled';

const ThumbnailCanvas = ({ thumb, newlyPagesAdded, canvasStyle, isDragging }: ThumbnailCanvasProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    const clone = thumb.src.cloneNode(true) as HTMLCanvasElement;
    const ctx = clone.getContext('2d');
    ctx?.drawImage(thumb.src, 0, 0);

    ref.current.appendChild(clone);
  }, [thumb.id]);
  return (
    <>
      <Styled.Canvas id={`canvas-${thumb.id}`} width={thumb.width} height={thumb.height} style={canvasStyle} />
      <div
        ref={ref}
        className={classNames('thumbnailCanvas', {
          isDragging,
          addedByMerged: newlyPagesAdded.includes(thumb.pageIndex) || newlyPagesAdded.includes(thumb.id),
        })}
        css={css`
          max-width: 100%;
          max-height: 100%;
          display: flex;
          canvas {
            object-fit: contain;
            /**
            * Override the default width and height of canvas
            */
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
            position: absolute;
            top: 0;
            left: 0;
            visibility: ${isDragging ? 'hidden' : 'visible'};
          }
        `}
      />
    </>
  );
};

export default ThumbnailCanvas;
