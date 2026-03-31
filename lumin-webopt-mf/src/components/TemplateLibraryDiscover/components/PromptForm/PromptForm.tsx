import { Fragment, useRef, useEffect, useState } from "react";

import Hourglass from "@/assets/images/svg/hourglass.svg";
import SparklesWhite from "@/assets/images/svg/sparkles-white.svg";

import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

import { useAiSuggestions } from "@/hooks/useAiSuggestions";
import useAnimatedPlaceholder from "@/hooks/useAnimatedPlaceholder";
import { useInlineCompletion } from "@/hooks/useInlineCompletion";
import { cn } from "@/lib/utils";
import type { AiSuggestion } from "@/services/claude.service";

import {
  InputMode,
  MIN_INPUT_WIDTH,
  PLACEHOLDER_TEXT,
  PROMPT_PLACEHOLDER,
} from "../../constants";
import { useFormActionsSelector, useFormStateSelector } from "../../store";

import { GhostTextarea } from "./GhostTextarea";
import { SuggestionChips } from "./SuggestionChips";

import styles from "./PromptForm.module.scss";

export interface IPromptFormProps {
  prompts: string[];
  placeholders: string[];
  onSubmit: (finalText: string) => void;
}

const ANIMATED_PLACEHOLDERS = [
  "Describe what you are looking for...",
  "ex: Find construction safety checklist templates for industrial sites.",
  "ex: Find forms to document environmental impact of construction.",
];

const SUBMIT_CLS = cn(
  "bg-[var(--kiwi-colors-support-purple-background-low)]",
  "text-[var(--kiwi-colors-core-on-secondary)]",
  "border-transparent shadow-[0_1px_3px_rgb(124_58_237/16%)]",
  "hover:shadow-[0_3px_8px_rgb(124_58_237/22%)]",
  "[&_img]:w-[18px] [&_img]:h-[18px] [&_span]:mr-[var(--kiwi-spacing-0-25)]",
);

export const PromptForm = ({
  prompts,
  placeholders,
  onSubmit,
}: IPromptFormProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState<string | null>(
    null,
  );

  const { answers, freeText, mode } = useFormStateSelector();

  const animatedPlaceholder = useAnimatedPlaceholder({
    placeholders: ANIMATED_PLACEHOLDERS,
    enabled: mode === InputMode.FREEDOM,
  });
  const { setAnswers, setFreeText, setMode } = useFormActionsSelector();

  const { suggestions, isLoading: isSuggestionsLoading } =
    useAiSuggestions(freeText);

  const { ghostText, acceptCompletion } = useInlineCompletion(freeText);

  const handleAcceptGhost = () => {
    const newText = acceptCompletion();
    if (newText) {
      setFreeText(newText);
    }
  };

  const fullText = prompts.join(" ");
  const parts = fullText.split(PROMPT_PLACEHOLDER);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const measureRef = useRef<HTMLSpanElement>(null);

  const inputCount = parts.length - 1;

  const updateInputWidth = (
    input: HTMLInputElement,
    value: string,
    placeholderText: string,
  ) => {
    if (!measureRef.current) return;
    measureRef.current.textContent =
      value || placeholderText || PLACEHOLDER_TEXT;
    const width = Math.max(
      measureRef.current.offsetWidth + 16,
      MIN_INPUT_WIDTH,
    );
    input.style.width = `${width}px`;
  };

  useEffect(() => {
    if (mode === InputMode.GUIDED) {
      inputRefs.current.forEach((input, index) => {
        if (input) {
          updateInputWidth(input, answers[index] || "", placeholders[index]);
        }
      });
    }
  }, [answers, mode, placeholders]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    const input = inputRefs.current[index];
    if (input) {
      updateInputWidth(input, value, placeholders[index]);
    }
  };

  const handleSuggestionSelect = (suggestion: AiSuggestion) => {
    const { original, corrected } = suggestion;
    const lowerFreeText = freeText.toLowerCase();
    const lowerOriginal = original.toLowerCase();
    const matchIndex = lowerFreeText.lastIndexOf(lowerOriginal);

    if (matchIndex !== -1) {
      const before = freeText.slice(0, matchIndex);
      const after = freeText.slice(matchIndex + original.length);
      setFreeText(before + corrected + after);
    } else {
      setFreeText(freeText.trimEnd() + " " + corrected);
    }
    setAcceptedSuggestion(corrected);
  };

  const buildFinalText = (): string => {
    if (mode === InputMode.FREEDOM) {
      return freeText.trim();
    }

    let result = fullText;
    answers.forEach((answer) => {
      result = result.replace(PROMPT_PLACEHOLDER, answer || "");
    });
    const trimmed = result.trim();
    return trimmed.endsWith(".") ? trimmed : trimmed + ".";
  };

  const handleSubmit = () => {
    onSubmit(buildFinalText());
  };

  const handleModeSelect = (newMode: InputMode) => {
    setMode(newMode);
    setIsDropdownOpen(false);
  };

  const isSubmitDisabled = mode === InputMode.FREEDOM && !freeText.trim();

  return (
    <>
      <h2 className="text-[var(--kiwi-colors-surface-on-surface)] mb-[var(--kiwi-spacing-3)] kiwi-headline-lg mb-2">
        Tell us what you&apos;re trying to do?
      </h2>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <img src={Hourglass} alt="Hourglass" />
        </div>

        {mode === InputMode.GUIDED ? (
          <div className={styles.promptParagraph}>
            <span
              ref={measureRef}
              className={styles.measureSpan}
              aria-hidden="true"
            />
            {parts.map((part, index) => (
              <Fragment key={index}>
                <span className={styles.promptText}>{part}</span>
                {index < inputCount && (
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    className={styles.inlineInput}
                    placeholder={placeholders[index] || PLACEHOLDER_TEXT}
                    value={answers[index] || ""}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                )}
              </Fragment>
            ))}
            <span className={styles.promptText}></span>
          </div>
        ) : acceptedSuggestion ? (
          <div className={styles.suggestionPreview}>
            <p className={styles.previewText}>{freeText}</p>
          </div>
        ) : (
          <GhostTextarea
            value={freeText}
            ghostText={ghostText}
            placeholder={animatedPlaceholder}
            rows={4}
            onChange={(e) => setFreeText(e.target.value)}
            onAcceptGhost={handleAcceptGhost}
          />
        )}
      </div>

      {mode === InputMode.FREEDOM && !acceptedSuggestion && (
        <SuggestionChips
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          onSelect={handleSuggestionSelect}
        />
      )}

      <div className="relative z-1 flex items-center justify-end gap-[var(--kiwi-spacing-1-5)] mt-[var(--kiwi-spacing-1-5)] pt-[var(--kiwi-spacing-1-5)] border-t border-[var(--kiwi-colors-surface-outline-variant)]">
        <div className={styles.modeSelector}>
          <Button
            type="button"
            variant="outline"
            endIcon={
              <AppIcon
                type="chevron-down-md"
                size="sm"
                color="var(--kiwi-colors-surface-on-surface-variant)"
              />
            }
            size="md"
            className="text-[var(--kiwi-colors-surface-on-surface)]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {mode === InputMode.GUIDED ? "Guided" : "Freedom"}
          </Button>
          {isDropdownOpen && (
            <div className={styles.modeDropdown}>
              <button
                className={cn(
                  styles.modeOption,
                  mode === InputMode.GUIDED && styles.active,
                )}
                onClick={() => handleModeSelect(InputMode.GUIDED)}
              >
                Guided
              </button>
              <button
                className={cn(
                  styles.modeOption,
                  mode === InputMode.FREEDOM && styles.active,
                )}
                onClick={() => handleModeSelect(InputMode.FREEDOM)}
              >
                Freedom
              </button>
            </div>
          )}
        </div>
        <Button
          startIcon={<img src={SparklesWhite} alt="sparkles" />}
          size="md"
          className={SUBMIT_CLS}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          Start finding
        </Button>
      </div>
    </>
  );
};

export default PromptForm;
