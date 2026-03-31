/* eslint-disable react/prop-types */
import { ClickAwayListener } from '@mui/material';
import { Icomoon, Popover, PopoverDropdown, PopoverTarget } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useRef, useState, useCallback, useEffect, forwardRef } from 'react';

import MaterialPopper from 'luminComponents/MaterialPopper';
import { TextInput } from 'luminComponents/ReskinLayout/components/TextInput';
import Input from 'luminComponents/Shared/Input';

import { usePrevious } from 'hooks';

import SearchInputPopper from './SearchInputPopper';
import { InputSize } from '../Input/types/InputSize';

import { useStyles } from './SearchInput.styled';

import styles from './SearchInput.module.scss';

const SearchInput = (props, forwardedRef) => {
  const {
    placeholder,
    resultComponent,
    onSelect,
    onChange: onChangeProps,
    options,
    autoFocus,
    disabled,
    loading,
    name,
    size,
    onClickAway,
    fullWidth,
    shouldShowTagList,
    tagList,
    handleRemoveTag,
    isReskin,
    label,
    autoComplete,
  } = props;
  const [text, setText] = useState('');
  const prevText = usePrevious(text);
  const inputRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const [popperShow, setPopperShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const isPopperShow = !!options.length && popperShow && !disabled && touched;
  const isPopperShowRef = useRef(isPopperShow);
  const classes = useStyles();

  const onChange = useCallback((e) => {
    const { value } = e.target;
    setText(value);
    onChangeProps(value);
    setTouched(true);
    setPopperShow(true);
  }, []);

  const withSelect = (item) => {
    if (prevText.length) {
      onChangeProps('');
    }
    onSelect(item);
    setTouched(false);
  };

  const onInputClick = () => {
    setTouched(true);
    setPopperShow(true);
  };

  function closePopper() {
    setTouched(false);
    setPopperShow(false);
  }

  const onArrowPress = (e) => {
    e.preventDefault();
    if (document.activeElement === inputRef.current) {
      setPopperShow(true);
    }
  };

  const onEscapePress = useCallback((e) => {
    if (isPopperShowRef.current) {
      e.stopPropagation();
      setPopperShow(false);
    }
  }, []);

  const onInputKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        onArrowPress(e);
        setTouched(true);
        break;
      }
      case 'Escape': {
        onEscapePress(e);
        break;
      }
      default:
    }
  }, []);

  const getPopperStyles = useCallback(
    () => ({
      width: `${inputWrapperRef?.current ? inputWrapperRef.current.offsetWidth : 320}px`,
    }),
    []
  );

  const handleClickAway = () => {
    onClickAway();
    closePopper();
  };

  const handleInputRef = (el) => {
    inputRef.current = el;
    if (forwardedRef) {
      forwardedRef.current = el;
    }
  };

  useEffect(() => {
    isPopperShowRef.current = isPopperShow;
  }, [isPopperShow]);

  if (isReskin) {
    return (
      <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway}>
        <div>
          <Popover opened={isPopperShow} offset={12} width="target">
            <PopoverTarget>
              <div>
                <TextInput
                  type="search"
                  name={name}
                  value={text}
                  disabled={disabled}
                  onChange={onChange}
                  onFocus={() => setPopperShow(true)}
                  onClick={onInputClick}
                  placeholder={placeholder}
                  label={label}
                  size="lg"
                  autoFocus={autoFocus}
                  leftSection={<Icomoon type="search-lg" size="lg" color="var(--kiwi-colors-surface-on-surface" />}
                  ref={inputRef}
                  autoComplete={autoComplete}
                />
              </div>
            </PopoverTarget>
            <PopoverDropdown paddingVariant="dense" className={styles.dropdownContainer}>
              <SearchInputPopper
                setPopperShow={setPopperShow}
                setText={setText}
                resultComponent={resultComponent}
                onSelect={withSelect}
                options={options}
                loading={loading}
                isReskin
              />
            </PopoverDropdown>
          </Popover>
        </div>
      </ClickAwayListener>
    );
  }

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway}>
      <div ref={inputWrapperRef}>
        <Input
          name={name}
          value={text}
          onChange={onChange}
          onFocus={() => setPopperShow(true)}
          onClick={onInputClick}
          showClearButton
          ref={handleInputRef}
          placeholder={placeholder}
          icon="search"
          onKeyDown={onInputKeyDown}
          disabled={disabled}
          size={size}
          fullWidth={fullWidth}
          shouldShowTagList={shouldShowTagList}
          tagList={tagList}
          handleRemoveTag={handleRemoveTag}
          inputData={{
            type: 'search',
          }}
        />
        {isPopperShow && (
          <MaterialPopper
            open
            anchorEl={inputWrapperRef?.current}
            parentOverflow="window"
            disablePortal={false}
            classes={classes.popper}
            style={getPopperStyles()}
            disableClickAway
          >
            <SearchInputPopper
              setPopperShow={setPopperShow}
              setText={setText}
              resultComponent={resultComponent}
              onSelect={withSelect}
              options={options}
              loading={loading}
              inputRef={inputRef}
            />
          </MaterialPopper>
        )}
      </div>
    </ClickAwayListener>
  );
};

const ForwardedSearchInput = forwardRef(SearchInput);

ForwardedSearchInput.propTypes = {
  placeholder: PropTypes.string,
  onSelect: PropTypes.func,
  resultComponent: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  name: PropTypes.string,
  size: PropTypes.oneOf(Object.values(InputSize)),
  onClickAway: PropTypes.func,
  fullWidth: PropTypes.bool,
  shouldShowTagList: PropTypes.bool,
  tagList: PropTypes.array,
  handleRemoveTag: PropTypes.func,
  isReskin: PropTypes.bool,
  label: PropTypes.string,
  autoComplete: PropTypes.string,
};

ForwardedSearchInput.defaultProps = {
  placeholder: 'Eg: lily@gmail.com',
  onSelect: () => {},
  onChange: () => {},
  options: [],
  autoFocus: false,
  disabled: false,
  loading: false,
  name: '',
  size: InputSize.LARGE,
  onClickAway: () => {},
  fullWidth: false,
  shouldShowTagList: false,
  tagList: [],
  handleRemoveTag: () => {},
  isReskin: false,
  label: '',
  autoComplete: 'off',
};

export default ForwardedSearchInput;
