import type { AiSuggestion } from "@/services/claude.service";

import styles from "./SuggestionChips.module.scss";

interface SuggestionChipsProps {
  suggestions: AiSuggestion[];
  isLoading: boolean;
  onSelect: (suggestion: AiSuggestion) => void;
}

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
      {isLoading ? (
        <div className={styles.loadingRow}>
          <span className={styles.shimmerChip} />
          <span className={styles.shimmerChip} />
          <span className={styles.shimmerChip} />
        </div>
      ) : (
        <>
          <span className={styles.label}>Did you mean:</span>
          <div className={styles.chipList}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.corrected}
                type="button"
                className={styles.chip}
                onClick={() => onSelect(suggestion)}
                title={`Replace "${suggestion.original}" with "${suggestion.corrected}"`}
              >
                {suggestion.corrected}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
