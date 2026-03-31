import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import PageRangeInput from 'lumin-components/GeneralLayout/components/PageRangeInput';

import { useTranslation } from 'hooks/useTranslation';

import styles from './RangeInputGroup.module.scss';

export interface RangeItem {
  id: string;
  value: string;
  errorMessage: string;
  isValidExpression: boolean;
}

export interface RangeInputGroupProps {
  ranges: RangeItem[];
  onChangeRangeValue: (value: string, isValid: boolean, id: string) => void;
  onBlurRangeValue: (value: string, isValid: boolean, errorMessage: string, id: string) => void;
  onDeleteRange: (id: string) => void;
}

const RangeInputGroup: React.FC<RangeInputGroupProps> = ({
  ranges,
  onChangeRangeValue,
  onBlurRangeValue,
  onDeleteRange,
}) => {
  const { t } = useTranslation();

  const handleRangeChange = (value: string, isValid: boolean, rangeId: string) => {
    onChangeRangeValue(value, isValid, rangeId);
  };

  const handleRangeBlur = (value: string, isValid: boolean, errorMessage: string, rangeId: string) => {
    onBlurRangeValue(value, isValid, errorMessage, rangeId);
  };

  return (
    <div className={styles.inputGroup}>
      {ranges.map((range, index) => (
        <div key={range.id} className={styles.inputContainer}>
          <PageRangeInput
            value={range.value}
            onChange={(value, isValid) => handleRangeChange(value, isValid, range.id)}
            onBlur={(value, isValid, errorMessage) => handleRangeBlur(value, isValid, errorMessage, range.id)}
            placeholder={t('message.EGPages', { pages: '1-3, 5, 7' })}
            error={range.errorMessage}
            label={t('viewer.leftPanelEditMode.document', { number: index + 1 })}
            style={{ width: '100%' }}
          />
          {index !== 0 && (
            <IconButton
              className={styles.deleteButton}
              icon="ph-trash"
              iconSize="md"
              onClick={() => onDeleteRange(range.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default RangeInputGroup;
