import React, {
  useRef, useState, useCallback, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useMeasure } from 'react-use';
import { debounce } from 'lodash';
import {
  useDesktopMatch, useTabletMatch, useSearchInputShortkey,
} from 'hooks';
import Icomoon from 'lumin-components/Icomoon';
import Input from 'lumin-components/Shared/Input';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';
import { MAX_LENGTH_DOCUMENT_NAME, MAX_TRUNCATED_FOLDER_NAME } from 'constants/documentConstants';
import { Colors } from 'constants/styles';
import { string as stringUtils } from 'utils';

import * as Styled from './SearchDocument.styled';

const INPUT_MAX_SIZE = 266;

const FOLDER_INPUT_MAX_SIZE = 206;

function SearchDocument({
  leftElement,
  onChange,
  disabled,
  folderName,
  isSearchView,
  setFocusing,
  placeholder,
  resetOn,
}) {
  const inputRef = useRef(null);
  const isDesktopMatched = useDesktopMatch();
  const isTabletMatched = useTabletMatch();
  const [searchText, setSearchText] = useState('');
  const [ref, { width: containerWidth }] = useMeasure();
  const isExpand = Boolean(searchText || isSearchView);

  const onChangeDebounced = useMemo(() => debounce((text) => {
    onChange(text);
  }, DEBOUNCED_SEARCH_TIME), []);

  function getMaxInputWidth() {
    if (isDesktopMatched) {
      return INPUT_MAX_SIZE;
    }
    if (isTabletMatched) {
      return folderName ? INPUT_MAX_SIZE : FOLDER_INPUT_MAX_SIZE;
    }
    return containerWidth;
  }

  const onTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_LENGTH_DOCUMENT_NAME) {
      setSearchText(text);
      onChangeDebounced(text);
    }
  };

  const renderFolderIcon = useCallback(() => folderName && (
    <Tooltip title={folderName}>
      <Styled.FolderBadge>
        <Icomoon
          size={20}
          className="search"
          color={Colors.NEUTRAL_60}
        />
        <Styled.FolderName>
          {stringUtils.getShortStringWithLimit(
            folderName,
            MAX_TRUNCATED_FOLDER_NAME,
          )}
        </Styled.FolderName>
      </Styled.FolderBadge>
    </Tooltip>
  ), [folderName]);

  useSearchInputShortkey(inputRef);

  useEffect(() => {
    setSearchText('');
    onChange('');
    inputRef.current.blur();
  }, [...resetOn]);

  return (
    <Styled.Container ref={ref}>
      <Styled.Content
        $isCollapsed={isExpand}
        $maxWidthInput={getMaxInputWidth()}
      >
        {leftElement}
      </Styled.Content>
      <Styled.Input
        $maxWidth={getMaxInputWidth()}
        $isExpanded={isExpand}
      >
        <Input
          fullWidth
          icon={!folderName ? 'search' : ''}
          placeholder={placeholder}
          value={searchText}
          onChange={onTextChange}
          ref={inputRef}
          onFocus={() => setFocusing(true)}
          onBlur={() => {
            if (inputRef.current !== document.activeElement) {
              setFocusing(false);
            }
          }}
          showClearButton
          iconPostfix={renderFolderIcon()}
          disabled={disabled}
          size={InputSize.MEDIUM}
        />
      </Styled.Input>
    </Styled.Container>
  );
}

SearchDocument.propTypes = {
  onChange: PropTypes.func.isRequired,
  leftElement: PropTypes.node,
  disabled: PropTypes.bool,
  folderName: PropTypes.string,
  isSearchView: PropTypes.bool,
  setFocusing: PropTypes.func,
  placeholder: PropTypes.string,
  resetOn: PropTypes.array,
};

SearchDocument.defaultProps = {
  leftElement: null,
  disabled: false,
  folderName: '',
  isSearchView: false,
  setFocusing: () => {},
  placeholder: 'Search',
  resetOn: [],
};

export default React.memo(SearchDocument);
