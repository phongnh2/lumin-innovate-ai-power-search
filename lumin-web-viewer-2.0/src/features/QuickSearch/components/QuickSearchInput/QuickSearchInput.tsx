import { Icomoon, IconSize, TextInput } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useSearchInputHandler } from 'features/QuickSearch/hooks/useSearchInputHandler';

const QuickSearchInput = () => {
  const { t } = useTranslation();
  const { inputRef, isOpenQuickSearch, onChangeSearchInput } = useSearchInputHandler();

  return (
    <TextInput
      ref={inputRef}
      placeholder={t('common.search')}
      style={{ width: '100%' }}
      readOnly={!isOpenQuickSearch}
      onChange={onChangeSearchInput}
      leftSection={
        <Icomoon type="ph-magnifying-glass" size={IconSize.md} color="var(--kiwi-colors-core-on-secondary-container)" />
      }
    />
  );
};

export default QuickSearchInput;
