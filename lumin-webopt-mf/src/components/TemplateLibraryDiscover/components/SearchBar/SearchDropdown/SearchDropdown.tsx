import { AppIcon } from "@/components/ui/app-icon";
import clsx from "clsx";

import type { SearchResponse, SearchHit } from "@/interfaces/api.interface";

import { SearchResultItem } from "../SearchResultItem";
import SearchResultErrorBoundary from "../SearchResultItem/ErrorBoundary";

import styles from "./SearchDropdown.module.scss";

const MAX_SEARCH_RESULTS = 5;

interface SearchDropdownProps {
  isVisible: boolean;
  isLoading: boolean;
  data?: SearchResponse;
  onItemClick?: (hit: SearchHit) => void;
  className?: string;
}

const SearchDropdown = ({
  isVisible,
  isLoading,
  data,
  onItemClick,
  className,
}: SearchDropdownProps) => {
  if (!isVisible) {
    return null;
  }

  if (data) {
    console.log("SearchDropdown data:", data);
  }

  const formResults =
    data?.results?.find((result) => result.indexUid === "form")?.hits || [];
  const hasResults = formResults.length > 0;

  const safeFormResults = formResults
    .filter((hit) => hit && hit.id)
    .slice(0, MAX_SEARCH_RESULTS);

  const handleItemClick = (hit: SearchHit) => {
    if (onItemClick) {
      onItemClick(hit);
    }
  };

  return (
    <div className={clsx(styles.container, className)}>
      {isLoading && (
        <div className={styles.loading}>
          {Array.from({ length: MAX_SEARCH_RESULTS }).map((_, index) => (
            <div key={index} className={styles.skeletonItem}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonText} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !hasResults && (
        <div className={styles.noResults}>
          <AppIcon
            type="search-lg"
            size="sm"
            color="var(--kiwi-colors-surface-on-surface-variant)"
          />
          <span>No results found</span>
        </div>
      )}

      {!isLoading && hasResults && (
        <div className={styles.results}>
          {safeFormResults.map((hit) => (
            <SearchResultErrorBoundary key={hit.id}>
              <SearchResultItem
                hit={hit}
                onClick={() => handleItemClick(hit)}
              />
            </SearchResultErrorBoundary>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
