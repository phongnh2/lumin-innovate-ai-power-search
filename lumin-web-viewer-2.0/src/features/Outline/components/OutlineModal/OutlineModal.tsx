import { isNumber } from 'lodash';
import isEqual from 'lodash/isEqual';
import { Button } from 'lumin-ui/kiwi-ui';
import React, { MutableRefObject, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import TextField from 'luminComponents/GeneralLayout/general-components/TextField';

import { useCleanup } from 'hooks/useCleanup';

import { useOutlineTreeContext } from 'features/Outline/contexts/Outline.context';
import { OutlineEvent } from 'features/Outline/types';
import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';
import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { OutlineBranchContext } from '../../contexts';
import { useModalTracking } from '../../hooks/useModalTracking';
import IntroduceOutlinePopover from '../IntroduceOutlinePopover';

import * as Styled from './OutlineModal.styled';

interface IOutlineModalProps {
  eventType: OutlineEvent;
  focusRef?: MutableRefObject<HTMLInputElement>;
  onHeightChange?: (height: number) => void;
}

const NUMERIC_REGEX = /^\d*$/;

const AddOutlineEvents: string[] = [OutlineEvent.ADD, OutlineEvent.ADD_SUB];

const OutlineModal = (props: IOutlineModalProps) => {
  const { eventType, focusRef, onHeightChange } = props;
  const outlineModalRef = useRef<HTMLDivElement>(null);
  const currentPage = useSelector(selectors.getCurrentPage);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { trackModalConfirm, trackModalDismiss, trackModalViewed } = useModalTracking(eventType);
  const [outlineNameElement, setOutlineNameElement] = useState<HTMLInputElement | null>(null);
  const totalPages = core.getTotalPages();

  // Context
  const { outline, onClose } = useContext(OutlineBranchContext);
  const { addOutline, modifyOutline, defaultOutline, setDefaultOutline } = useOutlineTreeContext();

  useEffect(() => {
    trackModalViewed();
  }, []);

  useLayoutEffect(() => {
    if (outlineModalRef.current && onHeightChange) {
      onHeightChange(outlineModalRef.current.offsetHeight);
    }
  }, [onHeightChange, eventType]);

  useCleanup(() => setDefaultOutline(null), []);

  const isEditEvent = eventType === OutlineEvent.EDIT;
  const defaultName = defaultOutline?.textContent;
  const name = defaultName || (isEditEvent ? outline.name : '');

  const getDestination = () => {
    if (isNumber(defaultOutline?.pageNumber)) {
      return defaultOutline.pageNumber.toString();
    }
    if (isEditEvent && isNumber(outline.pageNumber)) {
      return outline.pageNumber.toString();
    }
    return currentPage.toString();
  };

  // State
  const initialModalState = {
    name: OutlineStoreUtils.truncateTitle(name),
    destination: getDestination(),
  };

  const [modalState, setModalState] = useState<{
    name: string;
    destination: string;
  }>(initialModalState);

  // Funcs
  const onConfirm = () => {
    const slicedName = OutlineStoreUtils.truncateTitle(modalState.name);
    if (AddOutlineEvents.includes(eventType)) {
      addOutline({
        name: slicedName,
        isAddSub: eventType === OutlineEvent.ADD_SUB,
        pageNumber: parseInt(modalState.destination),
      });
    } else {
      modifyOutline({
        name: slicedName,
        pageNumber: Number(modalState.destination),
      });
    }
    trackModalConfirm();
    onClose();
  };

  const compareWithTotalPages = useDebouncedCallback((destination: string) => {
    if (parseInt(destination) > totalPages || parseInt(destination) === 0) {
      setModalState({
        ...modalState,
        destination: currentPage.toString(),
      });
    }
  }, 300);

  const handleChangeDest = (target: string) => {
    if (target !== '' && !NUMERIC_REGEX.test(target)) {
      return;
    }
    setModalState({
      ...modalState,
      destination: target,
    });
    compareWithTotalPages(target);
  };

  const handleChangeName = (target: string) => {
    setModalState({
      ...modalState,
      name: OutlineStoreUtils.truncateTitle(target),
    });
  };

  const onCancel = () => {
    dispatch(actions.setOutlineEvent(null));
    trackModalDismiss();
  };

  const checkModalButtonEnabled = () => {
    const isValidPageNumber = OutlineCoreUtils.isValidPageNumber(parseInt(modalState.destination));
    if (eventType !== OutlineEvent.EDIT) {
      return isValidPageNumber;
    }
    const isUpdatePageNumber = !isEqual(modalState, initialModalState) || !outline.pageNumber;
    return isUpdatePageNumber && isValidPageNumber;
  };

  const renderContent = (type: string) => {
    switch (type) {
      case OutlineEvent.ADD:
        return { title: t('outlines.actions.add'), action: t('common.add') };
      case OutlineEvent.ADD_SUB:
        return { title: t('outlines.actions.addSub'), action: t('common.add') };
      case OutlineEvent.EDIT:
        return { title: t('outlines.actions.edit'), action: t('common.update') };
      default:
        return { title: '', action: '' };
    }
  };

  const outlineNameCallbackRef = useCallback((ref: HTMLInputElement): void => {
    if (focusRef) {
      focusRef.current = ref;
    }
    setOutlineNameElement(ref);
  }, []);

  useEffect(() => {
    if (defaultOutline?.textContent || defaultOutline?.pageNumber) {
      setModalState((prevState) => ({
        name: OutlineStoreUtils.truncateTitle(defaultOutline.textContent || prevState.name || ''),
        destination: String(defaultOutline.pageNumber || prevState.destination || core.getCurrentPage()),
      }));
    }
  }, [defaultOutline?.textContent, defaultOutline?.pageNumber]);

  return (
    <Styled.OutlineModalWrapper ref={outlineModalRef}>
      <Styled.OutlineModal>
        <Styled.Wrapper>
          <Styled.Title>{renderContent(eventType).title}</Styled.Title>
        </Styled.Wrapper>

        <Styled.Wrapper>
          <Styled.Label>{t('outlines.modal.title')}</Styled.Label>
          <TextField
            ref={outlineNameCallbackRef}
            autoFocus
            value={modalState.name}
            onChange={(e) => handleChangeName(e.target.value)}
            placeholder={t('common.untitled')}
          />
          {outlineNameElement && <IntroduceOutlinePopover anchorEl={outlineNameElement} />}
        </Styled.Wrapper>

        <Styled.Wrapper>
          <Styled.Label>{t('outlines.modal.destination')}</Styled.Label>
          <TextField type="number" value={modalState.destination} onChange={(e) => handleChangeDest(e.target.value)} />
        </Styled.Wrapper>

        <Styled.ButtonGroup data-cy="outline_modal_button_group">
          <Button onClick={onCancel} variant="text" size="md">
            {t('common.cancel')}
          </Button>
          <Button disabled={!checkModalButtonEnabled()} onClick={onConfirm} variant="tonal" size="md">
            {renderContent(eventType).action}
          </Button>
        </Styled.ButtonGroup>
      </Styled.OutlineModal>
    </Styled.OutlineModalWrapper>
  );
};

export default OutlineModal;
