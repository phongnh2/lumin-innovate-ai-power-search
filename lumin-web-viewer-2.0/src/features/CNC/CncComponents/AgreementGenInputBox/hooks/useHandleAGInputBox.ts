import { useState, useRef, KeyboardEvent, MouseEvent, useMemo, useEffect, useCallback } from 'react';

import { eventTracking } from 'utils';

import { EXAMPLES_PROMPT_AGREEMENT, AGREEMENT_GEN_EVENTS, CONTEXT } from 'features/CNC/constants/agreementGenConstants';
import { useAgreementSectionStore } from 'features/CNC/hooks/useAgreementSectionStore';
import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';
import useShowWebChatbot from 'features/WebChatBot/hooks/useShowWebChatbot';

import styles from '../AgreementGenInputBox.module.scss';

export const useHandleAGInputBox = () => {
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const [allowSubmitting, setAllowSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const selectedMarkRef = useRef<HTMLElement | null>(null);
  const { isShowWebChatbot } = useShowWebChatbot();
  const { isVisible, setIsVisible } = useChatbotStore();
  const { selectedPrompt, setSelectedPrompt } = useAgreementSectionStore();

  const selectedPromptMessage = useMemo(
    () => EXAMPLES_PROMPT_AGREEMENT.find((prompt) => prompt.title === selectedPrompt?.title)?.promptMessage ?? '',
    [selectedPrompt]
  );

  const inputBoxRefCallback = useCallback((node: HTMLDivElement | null): void => {
    inputBoxRef.current = node;

    if (!node) return;

    const content = selectedPrompt?.promptMessage ?? '';
    if (content) {
      node.innerHTML = content;
      setAllowSubmitting(content.trim().length > 0);
    } else {
      node.innerHTML = '';
      setAllowSubmitting(false);
    }
  }, [selectedPrompt]);

  const handleChange = () => {
    const element = inputBoxRef.current;
    const isTextEmpty = element.innerText.trim() === '';
    if (isTextEmpty) {
      element.innerHTML = '';
    }
    setAllowSubmitting(!isTextEmpty);
  };

  const handleClearPrompt = () => {
    inputBoxRef.current.innerHTML = '';
    setAllowSubmitting(false);
    setSelectedPrompt(null);
  };

  const handleCollapse = () => {
    setIsCollapsed((prev) => !prev);
    if (isShowWebChatbot) {
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    if (!isVisible && inputBoxRef.current && inputBoxRef.current.querySelector('span') === null) {
      inputBoxRef.current.focus();
    }
    setIsCollapsed(isVisible);
    if (inputBoxRef.current) {
      const content = !isVisible ? selectedPromptMessage : '';
      inputBoxRef.current.innerHTML = content;
    }
  }, [isVisible, selectedPromptMessage]);

  useEffect(() => {
    eventTracking(isCollapsed ? AGREEMENT_GEN_EVENTS.MODAL_COLLAPSED : AGREEMENT_GEN_EVENTS.MODAL_EXPANDED, {
      modalName: 'agreementGenInputBox',
    }).catch(() => {});
  }, [isCollapsed]);

  const SAMPLE_PROMPTS = useMemo(
    () =>
      EXAMPLES_PROMPT_AGREEMENT.filter((prompt) => prompt.id).map((prompt) => ({
        ...prompt,
        onClick: () => {
          inputBoxRef.current.innerHTML = prompt.promptMessage;
          setAllowSubmitting(true);
          setSelectedPrompt(prompt);
          eventTracking(AGREEMENT_GEN_EVENTS.SAMPLE_PROMPT_SELECTED, {
            elementName: 'start_via_sample_prompt',
            elementPurpose: 'Click a sample prompt button',
            prompt_type: 'sample_prompt_original',
            sample_prompt_id: prompt.id.toFixed(1),
            context: CONTEXT.LUMINPDF_HOMEPAGE,
          }).catch(() => {});
        },
      })),
    []
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    if (selectedMarkRef.current) {
      selectedMarkRef.current.remove();
      selectedMarkRef.current = null;
    }
  };
  const handleMarkClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'SPAN') {
      if (selectedMarkRef.current) {
        selectedMarkRef.current.classList.remove(styles.activePromptMark);
      }
      selectedMarkRef.current = target.parentNode as HTMLElement;
      if (selectedMarkRef.current) {
        selectedMarkRef.current?.classList.add(styles.activePromptMark);
        const root = selectedMarkRef.current?.parentNode as HTMLElement;
        const range = document.createRange();
        const selection = window.getSelection();

        range.setStart(selectedMarkRef.current, 0);
        range.collapse(true);

        selection?.removeAllRanges();
        selection?.addRange(range);

        root?.focus();
      }
    } else {
      if (selectedMarkRef.current) {
        selectedMarkRef.current?.classList.remove(styles.activePromptMark);
      }
      selectedMarkRef.current = null;
    }
  };

  return {
    allowSubmitting,
    SAMPLE_PROMPTS,
    handleChange,
    handleClearPrompt,
    handleCollapse,
    handleMarkClick,
    inputBoxRef,
    isCollapsed,
    onKeyDown,
    selectedPrompt,
    inputBoxRefCallback,
  };
};
