import { motion, AnimatePresence } from 'motion/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useCleanup } from 'hooks/useCleanup';

import GroupToolsMenu from './components/GroupToolsMenu';
import QuickSearchGuideline from './components/QuickSearchGuideline';
import QuickSearchInput from './components/QuickSearchInput';
import { useQuickSearchGuideline } from './hooks/useQuickSearchGuideline';
import { resetQuickSearchResults } from './slices';

import styles from './QuickSearch.module.scss';

interface QuickSearchProps {
  onClickNavigationButton: (value: string) => boolean;
}

const QuickSearch = ({ onClickNavigationButton }: QuickSearchProps) => {
  const dispatch = useDispatch();
  const { hasClosedQuickSearchGuideline, onHideQuickSearchGuideline } = useQuickSearchGuideline();

  useCleanup(() => {
    dispatch(resetQuickSearchResults());
  }, []);

  return (
    <div className={styles.quickSearch}>
      <QuickSearchInput />
      <AnimatePresence mode="popLayout">
        {!hasClosedQuickSearchGuideline && (
          <motion.div key="guideline" layout animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
            <QuickSearchGuideline onClose={onHideQuickSearchGuideline} />
          </motion.div>
        )}
        <GroupToolsMenu onClickNavigationButton={onClickNavigationButton} />
      </AnimatePresence>
    </div>
  );
};

export default QuickSearch;
