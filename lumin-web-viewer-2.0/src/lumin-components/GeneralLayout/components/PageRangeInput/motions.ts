export const motionVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    scale: 0.95,
  },
};

export const motionTransition = {
  mass: 1,
  damping: 30,
  stiffness: 300,
  type: 'spring' as const,
  scale: { duration: 0.25 },
  opacity: { duration: 0.25 },
};
