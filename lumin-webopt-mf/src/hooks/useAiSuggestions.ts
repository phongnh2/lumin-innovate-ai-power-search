import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type { AiSuggestion } from "@/services/claude.service";
import { getAiSuggestions } from "@/services/claude.service";
import { isClaudeDisabled } from "@/services/mocks/claudeMock";

const AI_SUGGESTION_DEBOUNCE_MS = 800;
const MIN_INPUT_LENGTH = 3;

export const useAiSuggestions = (freeText: string) => {
  const [debouncedText, setDebouncedText] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    const trimmed = freeText.trim();

    if (trimmed.length < MIN_INPUT_LENGTH) {
      setDebouncedText("");
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedText(trimmed);
      setIsDebouncing(false);
    }, AI_SUGGESTION_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [freeText]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["ai-suggestions", debouncedText],
    queryFn: () => getAiSuggestions(debouncedText),
    enabled:
      debouncedText.length >= MIN_INPUT_LENGTH &&
      (isClaudeDisabled || !!process.env.LUMIN_CLAUDE_API_KEY),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  return {
    suggestions: (data?.suggestions ?? []) as AiSuggestion[],
    isLoading:
      (isLoading || isDebouncing) && freeText.trim().length >= MIN_INPUT_LENGTH,
    error,
  };
};
