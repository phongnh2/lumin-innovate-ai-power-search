// eslint-disable-next-line import/no-unresolved
import { CaretLeftIcon } from '@luminpdf/icons/dist/csr/CaretLeft';
// eslint-disable-next-line import/no-unresolved
import { CaretRightIcon } from '@luminpdf/icons/dist/csr/CaretRight';
// eslint-disable-next-line import/no-unresolved
import { MagnifyingGlassIcon } from '@luminpdf/icons/dist/csr/MagnifyingGlass';
import { IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import useRightPanelAnimationObserver from '@new-ui/hooks/useRightPanelAnimationObserver';

import { useTranslation } from 'hooks/useTranslation';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import toolsName from 'constants/toolsName';

import * as Styled from './SearchBox.styled';

const SearchBox = (props) => {
  const {
    isSearchPanelOpen,
    searchTextInput,
    onChange,
    onKeyDown,
    searchValue,
    activeResultIndex,
    onClickPrevious,
    onClickNext,
    onClickOverflow,
    results,
  } = props;

  const { t } = useTranslation();

  const disabledAction = results.length;

  const onSubmit = useMemo(
    () => handlePromptCallback({ callback: onClickOverflow, applyForTool: toolsName.REDACTION }),
    [onClickOverflow]
  );

  const onFocusTextInput = () => {
    searchTextInput.current.focus();
  };

  useRightPanelAnimationObserver(onFocusTextInput);

  return (
    <Styled.Container>
      <Styled.InputSection>
        <Styled.TextInput
          ref={searchTextInput}
          type="text"
          autoFocus={!isSearchPanelOpen}
          autoComplete="off"
          onChange={onChange}
          onKeyDown={onKeyDown}
          onClick={handlePromptCallback({ callback: () => {}, applyForTool: toolsName.REDACTION })}
          value={searchValue}
          placeholder={t('action.findInDocument')}
          size={20}
          showPrefix={isSearchPanelOpen}
          prefixProps={{ className: 'search' }}
          data-search-panel-open={isSearchPanelOpen}
        />
      </Styled.InputSection>

      <Styled.ActionSection $isSearchPanelOpen={isSearchPanelOpen}>
        {isSearchPanelOpen && (
          <Styled.ResultsCount $disabled={!disabledAction}>
            <span>{`${activeResultIndex + 1}/${results.length}`}</span>
            <Styled.Divider />
          </Styled.ResultsCount>
        )}
        <PlainTooltip content={t('common.previous')}>
          <IconButton
            disabled={!disabledAction}
            icon={<CaretLeftIcon size={20} />}
            onClick={handlePromptCallback({ callback: onClickPrevious, applyForTool: toolsName.REDACTION })}
            size="md"
          />
        </PlainTooltip>
        <PlainTooltip content={t('common.next')}>
          <IconButton
            disabled={!disabledAction}
            icon={<CaretRightIcon size={20} />}
            size="md"
            onClick={handlePromptCallback({ callback: onClickNext, applyForTool: toolsName.REDACTION })}
          />
        </PlainTooltip>

        {!isSearchPanelOpen && (
          <PlainTooltip content={t('action.showMore')}>
            <IconButton icon={<MagnifyingGlassIcon size={20} />} size="md" onClick={onSubmit} />
          </PlainTooltip>
        )}
      </Styled.ActionSection>
    </Styled.Container>
  );
};

SearchBox.propTypes = {
  searchTextInput: PropTypes.object.isRequired,
  searchValue: PropTypes.string,
  activeResultIndex: PropTypes.number.isRequired,
  results: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSearchPanelOpen: PropTypes.bool,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClickPrevious: PropTypes.func,
  onClickNext: PropTypes.func,
  onClickOverflow: PropTypes.func,
};

SearchBox.defaultProps = {
  isSearchPanelOpen: false,
  onChange: () => {},
  onKeyDown: () => {},
  onClickPrevious: () => {},
  onClickNext: () => {},
  onClickOverflow: () => {},
  searchValue: '',
};

export default SearchBox;
