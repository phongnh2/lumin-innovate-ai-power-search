import { TextInput } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

type SplitByPageSectionProps = {
  onChange: (value: string) => void;
  value: string | null;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error: string | null;
};

const SplitByPageSection: React.FC<SplitByPageSectionProps> = ({ onChange, value, onBlur, error }) => {
  const { t } = useTranslation();
  return (
    <TextInput
      label={t('viewer.pageTools.splitByNumberOfPagesTitle')}
      placeholder="E.g: 5"
      onChange={(e) => onChange(e.target.value)}
      value={value ?? ''}
      onBlur={onBlur}
      error={error}
      data-cy="number_of_pages_input"
    />
  );
};

export default SplitByPageSection;
