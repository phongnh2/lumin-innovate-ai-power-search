import { animate } from 'motion';
import { useMotionValue, ValueAnimationTransition } from 'motion/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setMessageAnimationState, selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

const delimiter = '';

export function useAnimatedText(text: string, messageId: string) {
  const dispatch = useDispatch();
  const animatedCursor = useMotionValue(0);
  const [cursor, setCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);
  const [isSameText, setIsSameText] = useState(true);

  const isAnimatingText = useSelector(editorChatBotSelectors.getMessageAnimationState(messageId));
  const animatedMessages = useSelector(editorChatBotSelectors.getAnimatedMessages);

  const hasBeenAnimated = animatedMessages[messageId] === false;

  useEffect(() => {
    if (prevText !== text) {
      setPrevText(text);
      setIsSameText(text.startsWith(prevText));

      if (!text.startsWith(prevText)) {
        setCursor(0);
      }
    }
  }, [text, prevText]);

  useEffect(() => {
    if (hasBeenAnimated) {
      setCursor(text.split(delimiter).length);
      return undefined;
    }

    dispatch(setMessageAnimationState({ messageId, isAnimating: true }));

    if (!isSameText) {
      animatedCursor.jump(0);
    }

    const controls = animate(animatedCursor, text.split(delimiter).length, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(latest) {
        setCursor(Math.floor(Number(latest)));
      },
      onComplete() {
        dispatch(setMessageAnimationState({ messageId, isAnimating: false }));
      },
    } as ValueAnimationTransition);

    return () => controls.stop();
  }, [animatedCursor, isSameText, text, messageId, hasBeenAnimated, dispatch]);

  return {
    text: text.split(delimiter).slice(0, cursor).join(delimiter),
    cursor,
    animated: cursor === text.split(delimiter).length,
    isAnimatingText,
  };
}
