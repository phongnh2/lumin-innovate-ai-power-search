import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";

import iconLoading from "@/assets/images/svg/icon-loading.svg";
import sparkles from "@/assets/images/svg/sparkles.svg";

import { cn } from "@/lib/utils";
import {
  useContextActionsSelector,
  useContextStateSelector,
} from "../../store";

const CHIP_BASE = cn(
  "inline-flex items-center gap-[var(--kiwi-spacing-0-5)] px-3 py-1.5",
  "border border-[var(--kiwi-colors-surface-outline-variant)] rounded-full",
  "bg-[var(--kiwi-colors-surface-surface-bright)] text-[var(--kiwi-colors-surface-on-surface)]",
  "cursor-pointer shadow-[0_1px_0_rgb(0_0_0/3%)] transition-all duration-150",
  "hover:bg-[var(--kiwi-colors-surface-container-low)]",
  "hover:border-[var(--kiwi-colors-support-purple-background-low)]",
  "hover:shadow-[0_1px_2px_rgb(0_0_0/6%),0_0_0_1px_rgb(124_58_237/8%)]",
  "focus-visible:outline-none",
  "focus-visible:shadow-[0_0_0_2px_var(--kiwi-colors-surface-surface-bright),0_0_0_4px_var(--kiwi-colors-support-purple-background-low)]",
  "kiwi-label-md",
);

const CHIP_SELECTED = cn(
  "bg-[var(--kiwi-colors-support-purple-background-low)]",
  "border-[var(--kiwi-colors-support-purple-background-low)]",
  "text-white shadow-[0_1px_2px_rgb(0_0_0/12%),inset_0_1px_0_rgb(255_255_255/18%)]",
);

const CONTINUE_CLS = cn(
  "bg-[var(--kiwi-colors-support-purple-background-low)]",
  "text-[var(--kiwi-colors-core-on-secondary)]",
  "border-transparent shadow-[0_1px_3px_rgb(124_58_237/16%)]",
  "hover:shadow-[0_3px_8px_rgb(124_58_237/22%)]",
);

export const ContextQuestions = () => {
  const { contextQuestions, contextAnswers, isLoadingContext, searchQuery } =
    useContextStateSelector();
  const { setContextAnswer, submitWithContext, skipContext } =
    useContextActionsSelector();

  if (isLoadingContext) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-[var(--kiwi-spacing-2)]">
        <img
          src={iconLoading}
          alt="loading"
          className="w-8 h-8 animate-[kiwi-spin_1.4s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite]"
        />
        <p className="text-[var(--kiwi-colors-support-purple-foreground-medium)] text-center kiwi-title-md">
          Analyzing your query for better results...
        </p>
      </div>
    );
  }

  if (contextQuestions.length === 0) {
    return (
      <div className="flex flex-col gap-[var(--kiwi-spacing-3)]">
        <h2 className="flex items-center gap-[var(--kiwi-spacing-1)] text-[var(--kiwi-colors-surface-on-surface)] kiwi-headline-lg">
          Ready to search
          <img src={sparkles} alt="" className="w-5 h-5" />
        </h2>
        <p className="text-[var(--kiwi-colors-surface-on-surface-low)] leading-[1.45] m-0 kiwi-label-md">
          No additional context needed for &ldquo;
          <span className="text-[var(--kiwi-colors-support-purple-foreground-medium)] font-semibold">
            {searchQuery}
          </span>
          &rdquo;. Click below to find your templates.
        </p>
        <div className="flex justify-end items-center gap-[var(--kiwi-spacing-1-5)] mt-[var(--kiwi-spacing-3)] pt-[var(--kiwi-spacing-3)] border-t border-[var(--kiwi-colors-surface-outline-variant)]">
          <Button size="md" className={CONTINUE_CLS} onClick={skipContext}>
            Continue to search
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(contextAnswers).length;

  return (
    <div className="flex flex-col gap-[var(--kiwi-spacing-3)]">
      <h2 className="flex items-center gap-[var(--kiwi-spacing-1)] text-[var(--kiwi-colors-surface-on-surface)] kiwi-headline-lg">
        Let&apos;s refine your search
        <img src={sparkles} alt="" className="w-5 h-5" />
      </h2>
      <p className="text-[var(--kiwi-colors-surface-on-surface-low)] leading-[1.45] m-0 kiwi-label-md">
        Based on &ldquo;
        <span className="text-[var(--kiwi-colors-support-purple-foreground-medium)] font-semibold">
          {searchQuery}
        </span>
        &rdquo;, answering these questions will help us find more relevant
        templates.
      </p>

      <div className="flex flex-col gap-[var(--kiwi-spacing-1-5)]">
        {contextQuestions.map((question) => (
          <div
            key={question.id}
            className={cn(
              "flex flex-col gap-[var(--kiwi-spacing-1)] p-[var(--kiwi-spacing-1-5)]",
              "rounded-[var(--kiwi-border-radius-md)] border border-[var(--kiwi-colors-surface-outline-variant)]",
              "bg-[var(--kiwi-colors-surface-container-low)] shadow-[0_1px_2px_rgb(0_0_0/4%)]",
            )}
          >
            <p className="text-[var(--kiwi-colors-surface-on-surface)] font-semibold m-0 kiwi-label-md">
              {question.question}
            </p>
            <div className="flex flex-wrap gap-[var(--kiwi-spacing-1)] gap-y-[var(--kiwi-spacing-0-75)]">
              {question.options.map((option) => {
                const isSelected = contextAnswers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(CHIP_BASE, isSelected && CHIP_SELECTED)}
                    onClick={() => setContextAnswer(question.id, option.value)}
                  >
                    {isSelected && (
                      <AppIcon type="check-md" size="xs" color="white" />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end items-center gap-[var(--kiwi-spacing-1-5)] mt-[var(--kiwi-spacing-3)] pt-[var(--kiwi-spacing-3)] border-t border-[var(--kiwi-colors-surface-outline-variant)]">
        <Button
          variant="ghost"
          size="md"
          className="text-[var(--kiwi-colors-surface-on-surface-variant)]"
          onClick={skipContext}
        >
          Skip
        </Button>
        <Button size="md" className={CONTINUE_CLS} onClick={submitWithContext}>
          {answeredCount > 0 ? "Continue with answers" : "Continue"}
        </Button>
      </div>
    </div>
  );
};
