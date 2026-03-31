import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CHAR_DELAY = 75;
const DEFAULT_IDLE_DELAY = 2200;

interface UseAnimatedPlaceholderOptions {
  placeholders: string[];
  charDelay?: number;
  idleDelay?: number;
  enabled?: boolean;
}

export function useAnimatedPlaceholder({
  placeholders,
  charDelay = DEFAULT_CHAR_DELAY,
  idleDelay = DEFAULT_IDLE_DELAY,
  enabled = true,
}: UseAnimatedPlaceholderOptions): string {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      setPlaceholderIndex(0);
      setDisplayedText("");
      setIsTyping(true);
    } else {
      clearTimers();
      setDisplayedText("");
      setIsTyping(false);
    }
  }, [enabled, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    clearTimers();

    const currentPlaceholder = placeholders[placeholderIndex];
    if (!currentPlaceholder) {
      setDisplayedText("");
      setIsTyping(false);
      return clearTimers;
    }

    const chars = Array.from(currentPlaceholder);
    let charIndex = 0;

    setDisplayedText("");
    setIsTyping(true);

    intervalRef.current = window.setInterval(() => {
      if (charIndex < chars.length) {
        setDisplayedText(chars.slice(0, charIndex + 1).join(""));
        charIndex += 1;
      } else {
        clearTimers();
        setIsTyping(false);

        timeoutRef.current = window.setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, idleDelay);
      }
    }, charDelay);

    return clearTimers;
  }, [
    placeholderIndex,
    charDelay,
    idleDelay,
    clearTimers,
    placeholders,
    enabled,
  ]);

  return useMemo(
    () => `${displayedText}${isTyping ? "|" : ""}`,
    [displayedText, isTyping],
  );
}

export default useAnimatedPlaceholder;
