import React, { useState, useRef, useEffect } from 'react';

import { SearchInput } from 'luminComponents/ReskinLayout/components/SearchInput';

import { useTranslation } from 'hooks';

import { useChooseFileContext } from 'features/ChooseFile/hooks';
import { ActionTypes } from 'features/ChooseFile/reducers/ChooseFile.reducer';

import { DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';

const SearchBar = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const searchingTimeout = useRef<NodeJS.Timeout>();

  const { state, dispatch } = useChooseFileContext();

  const setSearchKey = (value: string) => {
    dispatch({ type: ActionTypes.SET_SEARCH_KEY, payload: { value } });
  };

  const onChangeDebounced = (value: string) => {
    clearTimeout(searchingTimeout.current);
    searchingTimeout.current = setTimeout(() => {
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: true } });
      setSearchKey(value);
    }, DEBOUNCED_SEARCH_TIME);
  };

  const onInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    onChangeDebounced(value);
  };

  useEffect(() => {
    if (!state.searchKey) {
      setSearchValue('');
    }
  }, [state.searchKey]);

  return (
    <SearchInput
      size="lg"
      width="100%"
      placeholder={t('common.searchIn', { target: 'Lumin' })}
      onChange={onInputValueChange}
      value={searchValue}
    />
  );
};

export default SearchBar;
