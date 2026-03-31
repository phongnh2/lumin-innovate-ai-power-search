import { motion } from 'motion/react';
import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  ease?: string;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ children, duration = 0.2, distance = 0, ease = 'easeOut', className }) => (
  <motion.div
    className={className}
    initial={{ x: distance, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration, ease }}
  >
    {children}
  </motion.div>
);

export default FadeIn;
