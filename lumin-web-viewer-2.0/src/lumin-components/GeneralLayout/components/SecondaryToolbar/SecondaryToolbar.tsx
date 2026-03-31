import { Divider, IconButton } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';

import styles from './SecondaryToolbar.module.scss';

export const SecondaryToolbar: React.FC<{ active: boolean; children: React.ReactNode }> & {
  LeftSection: typeof SecondaryToolbarLeftSection;
  RightSection: typeof SecondaryToolbarRightSection;
  Divider: typeof SecondaryToolbarDivider;
  ToolTitle: typeof SecondaryToolbarToolTitle;
  ToolDescription: typeof SecondaryToolbarToolDescription;
  Container: typeof SecondaryToolbarContainer;
  CloseButton: typeof SecondaryToolbarCloseButton;
} = ({ active, children }) => (
  <motion.div
    layout
    initial={{ height: 0, opacity: 0, visibility: 'hidden' }}
    animate={{
      height: 'auto',
      opacity: active ? 1 : 0,
      visibility: active ? 'visible' : 'hidden',
    }}
    className={styles.secondaryToolbar}
    transition={{ duration: 0.1, ease: 'easeOut' }}
  >
    {active && <div className={styles.wrapper}>{children}</div>}
  </motion.div>
);

const SecondaryToolbarContainer: React.FC<{ children: React.ReactNode; hasCloseButton?: boolean }> = ({
  children,
  hasCloseButton = false,
}) => (
  <div className={styles.container} data-has-close-button={hasCloseButton}>
    {children}
  </div>
);

const SecondaryToolbarLeftSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.leftSection}>{children}</div>
);

const SecondaryToolbarRightSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.rightSection}>{children}</div>
);

const SecondaryToolbarDivider: React.FC = () => <Divider orientation="vertical" className={styles.divider} />;

const SecondaryToolbarToolTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.toolTitle}>{children}</div>
);

const SecondaryToolbarToolDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.toolDescription}>{children}</div>
);

const SecondaryToolbarCloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className={styles.closeButton}>
    <IconButton icon="ph-x" size="md" onClick={onClick} />
  </div>
);

SecondaryToolbar.LeftSection = SecondaryToolbarLeftSection;
SecondaryToolbar.RightSection = SecondaryToolbarRightSection;
SecondaryToolbar.Divider = SecondaryToolbarDivider;
SecondaryToolbar.ToolTitle = SecondaryToolbarToolTitle;
SecondaryToolbar.ToolDescription = SecondaryToolbarToolDescription;
SecondaryToolbar.Container = SecondaryToolbarContainer;
SecondaryToolbar.CloseButton = SecondaryToolbarCloseButton;

export default SecondaryToolbar;
