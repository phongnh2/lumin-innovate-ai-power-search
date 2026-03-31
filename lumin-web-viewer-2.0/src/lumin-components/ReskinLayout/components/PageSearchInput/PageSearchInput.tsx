import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation, useDesktopMatch, useGetCurrentFolder } from 'hooks';

import { DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';

import { SearchInput } from '../SearchInput';

import styles from './PageSearchInput.module.scss';

export type PageSearchInputProps = {
  closeSearchView?: () => void;
};

const PageSearchInput = ({ closeSearchView }: PageSearchInputProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  const searchingTimeout = useRef<NodeJS.Timeout>();

  const [searchValue, setSearchValue] = useState('');

  const isDesktopMatch = useDesktopMatch();
  const currentFolder = useGetCurrentFolder();

  const setSearchKey = (value: string) => dispatch(actions.setSearchKeyPageSearch(value));

  const setFocusing = (value: boolean) => dispatch(actions.setFocusingPageSearch(value));

  const inputRef = useRef<HTMLInputElement>(null);

  const { searchKey, findDocumentByName } = useSelector(selectors.getPageSearchData);

  // [START] Handle search document for file location feature
  useEffect(() => {
    if (!findDocumentByName) {
      return;
    }

    setSearchValue(searchKey);
    inputRef.current?.focus();
  }, [findDocumentByName, searchKey]);
  // [END]

  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      setSearchValue('');
      setSearchKey('');
      setFocusing(false);
      dispatch(actions.findDocumentByName(''));
      closeSearchView?.();
    };
  }, [location.pathname]);

  const onChangeDebounced = (value: string) => {
    clearTimeout(searchingTimeout.current);
    searchingTimeout.current = setTimeout(() => {
      setSearchKey(value);
    }, DEBOUNCED_SEARCH_TIME);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    onChangeDebounced(value);
  };

  const onInputBlur = () => {
    setFocusing(false);
    if (closeSearchView && !searchValue.trim().length) {
      closeSearchView();
    }
  };

  const onInputFocus = () => {
    setFocusing(true);
  };

  return (
    <div className={styles.container}>
      <SearchInput
        size="lg"
        width="100%"
        ref={inputRef}
        autoFocus={!isDesktopMatch}
        placeholder={t('common.search')}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onChange={onInputChange}
        onClear={() => closeSearchView?.()}
        value={searchValue}
        badgeProps={{
          active: !!currentFolder,
          content: currentFolder?.name,
          showTooltip: true,
        }}
      />
    </div>
  );
};

export default React.memo(PageSearchInput);
