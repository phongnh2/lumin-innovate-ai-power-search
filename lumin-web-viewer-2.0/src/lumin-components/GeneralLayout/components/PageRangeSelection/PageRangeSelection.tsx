import { Radio, RadioGroup } from 'lumin-ui/kiwi-ui';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { PAGE_RANGE_OPTIONS, PAGE_RANGES } from './constants';
import { PageRangeSelectionType } from './types';
import PageRangeInput from '../PageRangeInput';

import styles from './PageRangeSelection.module.scss';

const PageRangeSelection = (props: PageRangeSelectionType) => {
  const { t } = useTranslation();
  const {
    pageRangeType,
    listPageRanges,
    pageRangeValue,
    pageRangeError,
    pageRangeLabel,
    setPageRange,
    onPageRangeBlur,
    onPageRangeValueChange,
  } = props;

  const pageRanges = PAGE_RANGES.filter(({ value }) => listPageRanges.includes(value));
  const isSpecificPageOption = pageRangeType === PAGE_RANGE_OPTIONS.SPECIFIC_PAGES;

  return (
    <div>
      <motion.div layout="position">
        <RadioGroup value={pageRangeType}>
          {pageRanges.map(({ value, title }) => (
            <Radio
              key={value}
              value={value}
              wrapperProps={{ className: styles.radioItem }}
              label={<span className={styles.radioLabel}>{t(title)}</span>}
              onChange={() => setPageRange(value)}
            />
          ))}
        </RadioGroup>
      </motion.div>

      <AnimatePresence mode="wait">
        {isSpecificPageOption && (
          <PageRangeInput
            key="page-range-input"
            value={pageRangeValue}
            onChange={onPageRangeValueChange}
            onBlur={onPageRangeBlur}
            label={pageRangeLabel}
            error={pageRangeError}
            enableAnimation
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageRangeSelection;
