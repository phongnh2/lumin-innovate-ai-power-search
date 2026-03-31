import Fuse from 'fuse.js';
import { Icomoon as KiwiIcomoon, MenuItemBase, Paper } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import Popper from '@new-ui/general-components/Popper';

import selectors from 'selectors';

import { useLatestRef, useTranslation } from 'hooks';

import { toastUtils } from 'utils';

import { formFieldAutocompleteBase } from 'features/FormFieldAutosuggestion';
import {
  useInputFieldEvent,
  useBroadcastChannel,
  useOnFocusTextField,
  useTextFieldChanged,
} from 'features/FormFieldAutosuggestion/hooks';
import { FormFieldSuggestion } from 'features/FormFieldAutosuggestion/types';
import { DATA_IDENTITY } from 'features/FormFieldAutosuggestion/utils';

import { ModalTypes } from 'constants/lumin-common';

import { IUser } from 'interfaces/user/user.interface';

import styles from './TextFieldAutocomplete.module.scss';

function TextFieldAutocomplete(): React.ReactElement {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { _id: userId } = currentUser || {};

  const [inputEl, setInputEl] = useState<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(null);
  const [searchResult, setSearchResult] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const { t } = useTranslation();

  const isEnabledRef = useLatestRef<boolean>(isEnabled);
  const highlightRef = useLatestRef<number>(highlightedIndex);
  const searchResultRef = useLatestRef<string[]>(searchResult);

  const fieldRef = useRef<Core.Annotations.Forms.Field>();
  const fuseSearchRef = useRef<Fuse<FormFieldSuggestion>>(null);
  const isMouseClickMenuRef = useRef<boolean>(false);

  const initTrieSearch = async (): Promise<void> => {
    const listSuggestion = await formFieldAutocompleteBase.getAll();
    const fuseSearch = new Fuse(listSuggestion, {
      keys: ['content'],
      includeScore: true,
      threshold: 0.3,
      findAllMatches: true,
    });
    fuseSearchRef.current = fuseSearch;
  };

  useInputFieldEvent({
    isMouseClickMenuRef,
    highlightRef,
    fuseSearchRef,
    searchResultRef,
    fieldRef,
    setInputEl,
    setSearchResult,
    setHighlightedIndex,
    inputEl,
  });

  useBroadcastChannel({ fuseSearchRef, setIsEnabled, initTrieSearch });
  useOnFocusTextField({ fieldRef, setInputEl, setSearchResult, setHighlightedIndex });
  useTextFieldChanged({ isMouseClickMenuRef, highlightRef, isEnabledRef });

  useEffect(() => {
    formFieldAutocompleteBase
      .isEnabled(userId)
      .then((enable) => {
        if (enable) {
          setIsEnabled(enable);
          initTrieSearch().catch(() => {});
        }
      })
      .catch(() => {});
  }, [userId]);

  const onMenuMouseUp = () => {
    isMouseClickMenuRef.current = false;
  };

  const onMenuMouseDown = () => {
    isMouseClickMenuRef.current = true;
  };

  const removeItem = (item: string) => async (e: React.MouseEvent<HTMLDivElement>) => {
    const toastSetting = {
      type: ModalTypes.SUCCESS,
      message: t('settingGeneral.toastDeleteEntry'),
    };
    e.stopPropagation();
    setSearchResult((prevResult) => prevResult.filter((res) => res !== item));
    await formFieldAutocompleteBase.delete(item);
    toastUtils.success(toastSetting);
  };

  const onClick = (item: string) => () => {
    fieldRef.current.setValue(item);
    setInputEl(null);
    setSearchResult([]);
  };

  if (!inputEl) {
    return null;
  }

  return (
    <Popper
      open={searchResult.length > 0}
      anchorEl={inputEl}
      sx={{
        width: inputEl.clientWidth,
        minWidth: '160px',
      }}
      placement="bottom-start"
    >
      <Paper className={styles.menuPaper} radius="md">
        {searchResult.map((item: string, index: number) => (
          <MenuItemBase
            key={item}
            onClick={onClick(item)}
            onMouseDown={onMenuMouseDown}
            onMouseUp={onMenuMouseUp}
            activated={highlightedIndex === index}
            data-identity={DATA_IDENTITY}
            className={styles.menuItem}
          >
            <span className={styles.menuItemText}>{item}</span>{' '}
            <div role="button" className={styles.closeBtn} onClick={removeItem(item)} tabIndex={0}>
              <KiwiIcomoon type="x-sm" size="sm" />
            </div>
          </MenuItemBase>
        ))}
      </Paper>
    </Popper>
  );
}

export default TextFieldAutocomplete;
