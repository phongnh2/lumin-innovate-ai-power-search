import { MutableRefObject, useEffect } from 'react';

export const useSpeechUtteranceEvents = ({
  utterance,
  events,
  deps,
}: {
  utterance: MutableRefObject<SpeechSynthesisUtterance>;
  events: { [key: string]: (e: SpeechSynthesisEvent) => void };
  deps?: unknown[];
}) => {
  useEffect(() => {
    const currentUtterance = utterance.current;

    Object.entries(events).forEach(([event, handler]) => {
      currentUtterance.addEventListener(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        currentUtterance.removeEventListener(event, handler);
      });
    };
  }, deps ?? []);
};
