import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { useState } from "react";

import Sparkles from "@/assets/images/svg/sparkles.svg";

import { useUploadAndViewPdf } from "@/hooks/useUploadAndViewPdf";
import type { SearchHit } from "@/services/prompts.service";
import { formatUsageCount, USAGE_OFFSET } from "@/utils/formatUsage";
import { getHighResThumbnail, parseInternalNotes } from "@/utils/template";

import { useSearchStateSelector } from "../../store";

import styles from "./TemplateResultsModal.module.scss";

interface ITemplateResultsModalProps {
  handleEdit: () => void;
  onFollowUpClick: (chipText: string) => void;
}

export const TemplateResultsModal = ({
  handleEdit,
  onFollowUpClick,
}: ITemplateResultsModalProps) => {
  const { searchQuery, searchResults, followUpData } = useSearchStateSelector();
  const { uploadAndView } = useUploadAndViewPdf();
  const [loadingTemplateId, setLoadingTemplateId] = useState<number | null>(
    null,
  );

  const formattedQuery = searchQuery
    .replace(/___/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const hits = searchResults?.hits ?? [];
  const followUpQueries = followUpData?.follow_up_queries ?? [];

  const renderTemplateCard = (hit: SearchHit) => {
    const parsed = parseInternalNotes(hit.internalNotes);
    const isLoading = loadingTemplateId === hit.id;
    const isDisabled = loadingTemplateId && loadingTemplateId !== hit.id;

    return (
      <div
        key={hit.id}
        className={`${styles.templateCard} ${isDisabled ? styles.disabled : ""}`}
        onClick={() => handleTemplateClick(hit)}
      >
        <div className={styles.templatePreview}>
          {parsed?.thumbnail && (
            <img
              src={getHighResThumbnail(parsed.thumbnail)}
              alt={hit.title}
              className={styles.thumbnail}
            />
          )}
          {isLoading && (
            <div className={styles.progressOverlay}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.templateInfo}>
          <h3 className={styles.templateTitle}>{hit.title}</h3>
          <p className={styles.templateUsage}>
            {formatUsageCount(hit.totalUsed + USAGE_OFFSET)}
          </p>
        </div>
      </div>
    );
  };

  const handleTemplateClick = async (hit: SearchHit) => {
    if (loadingTemplateId) {
      return;
    }

    const parsed = parseInternalNotes(hit.internalNotes);
    if (parsed?.file) {
      setLoadingTemplateId(hit.id);
      try {
        await uploadAndView({
          fileUrl: parsed.file,
          title: hit.title,
          action: "view",
        });
      } catch (error) {
        console.error("Failed to upload and view PDF:", error);
      } finally {
        setLoadingTemplateId(null);
      }
    }
  };

  return (
    <div>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>
          {hits.length} templates that match your needs
          <img src={Sparkles} alt="sparkles" className={styles.sparklesIcon} />
        </h2>
        <div className={styles.searchQuery}>
          {formattedQuery}
          <Button
            size="sm"
            variant="elevated"
            type="button"
            startIcon={
              <AppIcon
                type="pencil-simple-line-lg"
                size="sm"
                color="var(--kiwi-colors-surface-on-surface-variant)"
              />
            }
            className={styles.editButton}
            onClick={handleEdit}
          >
            Edit
          </Button>
        </div>
      </div>
      <div className={styles.templatesList}>{hits.map(renderTemplateCard)}</div>
      <div className={styles.templatesGridSeparator} />
      <div className={styles.resultsFooter}>
        <div className={styles.followUpChips}>
          {followUpQueries.map((query) => (
            <button
              key={query}
              type="button"
              className={styles.followUpChip}
              onClick={() => onFollowUpClick(query)}
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateResultsModal;
