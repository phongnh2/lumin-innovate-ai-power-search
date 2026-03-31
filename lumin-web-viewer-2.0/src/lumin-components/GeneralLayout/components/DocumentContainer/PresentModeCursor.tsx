import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';

import styles from './PresentModeCursor.module.scss';

interface PresentModeCursorProps {
  isActive?: boolean;
  color?: string;
  size?: number;
  clickEffect?: boolean;
}

const PresentModeCursor = ({
  isActive = true,
  color = 'var(--kiwi-colors-core-on-primary-container)',
  size = 24,
  clickEffect = true,
}: PresentModeCursorProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setClicking(true);
    };

    const handleMouseUp = () => {
      setClicking(false);
    };

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);

      if (clickEffect) {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);

      if (clickEffect) {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isActive, clickEffect]);

  const variants = {
    default: {
      x: mousePosition.x - size / 2 - (size / 4),
      y: mousePosition.y - size / 2 - (size / 4),
      scale: 1,
    },
    clicking: {
      x: mousePosition.x - size / 2 - (size / 4),
      y: mousePosition.y - size / 2 - (size / 4),
      scale: 1.5,
    },
  };

  // If cursor isn't active, don't render anything
  if (!isActive) return null;

  return (
    <motion.div
      className={styles.cursor}
      variants={variants}
      animate={clicking ? 'clicking' : 'default'}
      transition={{
        type: 'spring',
        stiffness: 1000,
        damping: 40,
        mass: 0.2,
        restDelta: 0.001,
      }}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  );
};

export default PresentModeCursor;
