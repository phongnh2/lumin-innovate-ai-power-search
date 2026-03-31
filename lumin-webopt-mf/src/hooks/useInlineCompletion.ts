import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { getInlineCompletion } from "@/services/claude.service";
import { isClaudeDisabled } from "@/services/mocks/claudeMock";

const COMPLETION_DEBOUNCE_MS = 600;
const MIN_INPUT_LENGTH = 5;
const MAX_COMPLETION_WORDS = 10;

const isValidCompletion = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.split(/\s+/).length > MAX_COMPLETION_WORDS) return false;
  if (
    /empty string|no\s+(meaningful\s+)?completion|already\s+complete/i.test(
      trimmed,
    )
  )
    return false;
  if (/^\(.*\)$/.test(trimmed)) return false;
  return true;
};

export const useInlineCompletion = (freeText: string) => {
  const [debouncedText, setDebouncedText] = useState("");
  const lastAcceptedRef = useRef("");

  useEffect(() => {
    const trimmed = freeText.trim();

    if (trimmed.length < MIN_INPUT_LENGTH) {
      setDebouncedText("");
      return;
    }

    if (
      lastAcceptedRef.current &&
      trimmed.startsWith(lastAcceptedRef.current)
    ) {
      lastAcceptedRef.current = "";
    }

    const timer = setTimeout(() => {
      setDebouncedText(trimmed);
    }, COMPLETION_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [freeText]);

  const { data: completion } = useQuery({
    queryKey: ["inline-completion", debouncedText],
    queryFn: () => getInlineCompletion(debouncedText),
    enabled:
      debouncedText.length >= MIN_INPUT_LENGTH &&
      (isClaudeDisabled || !!process.env.LUMIN_CLAUDE_API_KEY),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const trimmedInput = freeText.trim();
  const isStale = trimmedInput !== debouncedText;
  const ghostText =
    !isStale && completion && isValidCompletion(completion) ? completion : "";

  const acceptCompletion = useCallback(() => {
    if (!ghostText) return "";
    const needsSpace = !freeText.endsWith(" ") && !ghostText.startsWith(" ");
    const newText = needsSpace
      ? freeText + " " + ghostText
      : freeText + ghostText;
    lastAcceptedRef.current = newText.trim();
    setDebouncedText("");
    return newText;
  }, [freeText, ghostText]);

  return {
    ghostText,
    acceptCompletion,
  };
};
