import { CircularProgress, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useAutoClose } from './useAutoClose';

import styles from './BackDrop.module.scss';

const BackDrop = () => {
  const message = useSelector(selectors.getBackDropMessage);
  const configs = useSelector(selectors.getBackDropConfigs);
  const { status = 'loading' } = configs || {};

  const getIcon = useCallback(() => {
    switch (status) {
      case 'loading':
        return <CircularProgress size="xs" color="white" />;
      case 'success':
        return <KiwiIcomoon size="sm" type="circle-check-filled-sm" />;
      default:
        return null;
    }
  }, [status]);

  useAutoClose();

  return (
    <AnimatePresence>
      {!!message && (
        <motion.div
          key="backdrop"
          className={styles.toastOverlay}
          exit={{ opacity: 0 }}
          initial={{ width: 'auto' }}
          animate={{ width: 'auto' }}
          layout
        >
          <motion.div data-cy="backdrop_toast" className={styles.toastContainer} layout="position">
            {getIcon()}
            <p>{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackDrop;
