import type { AiSuggestion } from "@/services/claude.service";

import styles from "./SuggestionChips.module.scss";

interface SuggestionChipsProps {
  suggestions: AiSuggestion[];
  isLoading: boolean;
  onSelect: (suggestion: AiSuggestion) => void;
}

const SHIMMER_WIDTHS = [88, 112, 68];

export const SuggestionChips = ({
  suggestions,
  isLoading,
  onSelect,
}: SuggestionChipsProps) => {
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Did you mean:</span>
      <div className={styles.chipList}>
        {isLoading
          ? SHIMMER_WIDTHS.map((width, i) => (
              <span key={i} className={styles.shimmerChip} style={{ width }} />
            ))
          : suggestions.map((suggestion, i) => (
              <button
                key={suggestion.corrected}
                type="button"
                className={styles.chip}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => onSelect(suggestion)}
                title={`Replace "${suggestion.original}" with "${suggestion.corrected}"`}
              >
                {suggestion.corrected}
              </button>
            ))}
      </div>
    </div>
  );
};
