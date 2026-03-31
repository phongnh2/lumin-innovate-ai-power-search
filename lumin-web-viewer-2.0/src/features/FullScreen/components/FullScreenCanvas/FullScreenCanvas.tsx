import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import PageNavigation from '@new-ui/components/PageNavigation';

import selectors from 'selectors';

import { PresentationManager } from 'features/FullScreen/core/presentationManager';

import styles from './FullScreenCanvas.module.scss';

const FullScreenCanvas = () => {
  const currentPage = useSelector(selectors.getCurrentPage);
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presentationManagerRef = useRef<PresentationManager>();

  useEffect(() => {
    if (!presentationManagerRef.current) {
      presentationManagerRef.current = new PresentationManager(canvasRef.current);
    }
    presentationManagerRef.current.render(currentPage);
    return () => {
      presentationManagerRef.current.cancelLoading(currentPage);
    };
  }, [currentPage]);

  return (
    <div ref={ref} className={styles.container}>
      <canvas ref={canvasRef} />
      <PageNavigation isNarrowScreen={false} />
    </div>
  );
};

export default FullScreenCanvas;
