import { Text } from 'lumin-ui/kiwi-ui';
import { motion } from 'motion/react';
import React from 'react';

import styles from './GroupToolsMenu.module.scss';

interface GroupToolLabelProps {
  searchKeyword: string;
  label: string;
}

const GroupToolLabel = ({ searchKeyword, label }: GroupToolLabelProps) => {
  if (searchKeyword) {
    return null;
  }

  return (
    <motion.div
      id="group-label"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Text type="label" size="sm" className={styles.groupLabel} color="var(--kiwi-colors-surface-on-surface-low)">
        {label}
      </Text>
    </motion.div>
  );
};

export default GroupToolLabel;
