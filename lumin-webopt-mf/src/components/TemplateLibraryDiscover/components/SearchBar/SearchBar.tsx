import clsx from "clsx";
import { useRef, useState, useCallback } from "react";

import Sparkles from "@/assets/images/svg/sparkles.svg";

import { Template } from "@/components/Template";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

import { useClickOutside } from "@/hooks/useClickOutside";
import { usePrompts } from "@/hooks/usePrompts";
import { useSearchTemplates } from "@/hooks/useSearchTemplates";
import type { SearchHit } from "@/interfaces/api.interface";
import type { PromptsData } from "@/services/prompts.service";

import { useModalActionsSelector, useResetActionsSelector } from "../../store";
import { SmartFindingModal } from "../SmartFindingModal/SmartFindingModal";

import { SearchDropdown } from "./SearchDropdown";

import styles from "./SearchBar.module.scss";

const DEFAULT_PROMPTS = [
  "I'm trying to ___",
  "so I'm looking for ___",
  "that works in ___",
];
const DEFAULT_PLACEHOLDERS = ["action", "template", "jurisdiction"];

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchBar = ({
  onSearch,
  onClear,
  showClearButton = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const { openModal, closeModal } = useModalActionsSelector();
  const { resetAll } = useResetActionsSelector();

  const { data } = usePrompts() as { data: PromptsData | undefined };
  const {
    searchText,
    updateSearchText,
    clearSearch,
    data: searchData,
    isLoading: isSearchLoading,
  } = useSearchTemplates();

  const handleFocus = () => {
    setIsFocused(true);
    if (searchText.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateSearchText(value);
    setShowDropdown(value.length > 0);
  };

  const handleOpenModal = () => openModal();

  const handleCloseModal = () => {
    closeModal();
    resetAll();
  };

  const handleSearchItemClick = (hit: SearchHit) => {
    setSelectedTemplateId(Number(hit.id));
    setShowDropdown(false);
  };

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      closeDropdown();
      onSearch?.(searchText.trim());
    }
  };

  const handleClearClick = () => {
    clearSearch();
    closeDropdown();
    onClear?.();
  };

  useClickOutside({
    ref: containerRef,
    onClickOutside: closeDropdown,
    enabled: showDropdown,
  });

  const activePrompts = data?.prompts?.length ? data.prompts : DEFAULT_PROMPTS;

  return (
    <>
      <div
        ref={containerRef}
        className={clsx(styles.container, isFocused && styles.focus)}
      >
        <label htmlFor="search">
          <AppIcon
            type="search-lg"
            size="sm"
            color="var(--kiwi-colors-surface-on-surface-variant)"
          />
        </label>
        <input
          id="search"
          className={styles.input}
          placeholder="Search keywords"
          autoComplete="off"
          autoFocus
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {showClearButton && (
          <button
            className={styles.clearButton}
            onClick={handleClearClick}
            type="button"
          >
            <AppIcon type="x-lg" size="sm" />
          </button>
        )}
        <span className={styles.separator} />
        <Button
          startIcon={<img src={Sparkles} alt="sparkles" />}
          size="sm"
          className={styles.smartFindingButton}
          onClick={handleOpenModal}
        >
          <span className={styles.smartFindingButtonText}>Smart finding</span>
        </Button>
        <SearchDropdown
          isVisible={showDropdown}
          isLoading={isSearchLoading}
          data={searchData}
          onItemClick={handleSearchItemClick}
        />
      </div>
      <SmartFindingModal
        prompts={activePrompts}
        placeholders={DEFAULT_PLACEHOLDERS}
        onClose={handleCloseModal}
      />
      <Template.DetailModal
        isOpen={!!selectedTemplateId}
        templateId={selectedTemplateId ?? 0}
        onClose={() => setSelectedTemplateId(null)}
      />
    </>
  );
};

export default SearchBar;
