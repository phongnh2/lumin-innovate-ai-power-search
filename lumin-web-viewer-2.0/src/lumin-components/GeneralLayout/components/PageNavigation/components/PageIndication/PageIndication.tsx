import { IconButton } from 'lumin-ui/kiwi-ui';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { isIOS } from 'helpers/device';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import usePageNavigate, { NavigateType } from '../../hook/usePageNavigate';
import { IPageIndicationProps } from '../../interface';
import { InputType } from '../InputButton';
import PresenterModePageIndication from '../PresenterModePageIndication/PresenterModePageIndication';

import * as Styled from './PageIndication.styled';

const PageIndication = ({ disabledInput, isInPresenterMode }: IPageIndicationProps): JSX.Element => {
  const textInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>('1');
  const currentPage = useSelector(selectors.getCurrentPage);
  const totalPages = useSelector(selectors.getTotalPages);
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);

  const { getValidPageNumber, getPageByAction } = usePageNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const validPageNumber = getValidPageNumber(input);
    if (validPageNumber.toString() !== input) {
      setInput(validPageNumber.toString());
    }
    core.setCurrentPage(validPageNumber, false);
    textInputRef.current?.blur();
  };

  const onPageNavigate = (navigateType: NavigateType): void => {
    const updatedPage = getPageByAction(navigateType);
    core.setCurrentPage(updatedPage, false);
  };

  const onBlur = (e: React.ChangeEvent<HTMLInputElement> | React.FocusEvent<HTMLFormElement, Element>): void => {
    if (currentPage !== parseInt(input)) {
      onSubmit(e);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value.trim();
    if (inputValue.length && !Number(e.target.value)) {
      return;
    }
    setInput(inputValue);
  };

  const onFocus = (): void => {
    if (!textInputRef.current) {
      return;
    }
    if (isIOS) {
      textInputRef.current.setSelectionRange(0, 9999);
    } else {
      textInputRef.current.select();
    }
  };

  useEffect(() => {
    if (currentPage !== parseInt(input)) {
      setInput(currentPage.toString());
    }
  }, [currentPage]);

  return (
    <Styled.PageNumberWrapper>
      <IconButton
        data-lumin-btn-name={ButtonName.GO_TO_FIRST_PAGE}
        disabled={currentPage === 1 || isAiProcessing}
        onClick={() => {
          onPageNavigate(NavigateType.GO_FIRST);
        }}
        icon="ph-caret-double-left"
      />
      <IconButton
        onClick={() => {
          onPageNavigate(NavigateType.GO_PREVIOUS);
        }}
        disabled={currentPage === 1 || isAiProcessing}
        icon="ph-caret-left"
      />

      <Styled.PageDetail data-cy="page_detail_wrapper">
        {isInPresenterMode ? (
          <Styled.TotalPages>
            <PresenterModePageIndication currentPage={currentPage} totalPages={totalPages} />
          </Styled.TotalPages>
        ) : (
          <>
            <Styled.PageNumberInput
              ref={textInputRef}
              defaultValue={currentPage}
              isDisabled={disabledInput || isAiProcessing}
              onChange={onChange}
              onSubmit={onSubmit}
              onFocus={onFocus}
              onBlur={onBlur}
              inputType={InputType.TEXT}
              value={input}
              data-lumin-btn-name={ButtonName.CHANGE_PAGE_NUMBER}
            />
            <Styled.TotalPages>{`/${totalPages}`}</Styled.TotalPages>
          </>
        )}
      </Styled.PageDetail>

      <IconButton
        data-lumin-btn-name={ButtonName.NEXT_PAGE}
        onClick={() => {
          onPageNavigate(NavigateType.GO_NEXT);
        }}
        icon="ph-caret-right"
        disabled={currentPage === totalPages || isAiProcessing}
      />
      <IconButton
        data-lumin-btn-name={ButtonName.GO_TO_LAST_PAGE}
        onClick={() => {
          onPageNavigate(NavigateType.GO_LAST);
        }}
        disabled={currentPage === totalPages || isAiProcessing}
        icon="ph-caret-double-right"
      />
    </Styled.PageNumberWrapper>
  );
};

export default PageIndication;
