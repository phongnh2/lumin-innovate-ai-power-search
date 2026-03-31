import { useQuery } from "@tanstack/react-query";

import InformationBlock from "@/components/Shared/InformationBlock";
import TemplateDetailBadge from "@/components/Shared/TemplateDetailBadge";
import { LUMIN_BADGES_TYPES } from "@/components/Shared/TemplateDetailBadge/constants";
import TemplateRevisions from "@/components/Shared/TemplateRevisions";
import ThumbnailBlock from "@/components/Shared/ThumbnailBlock/ThumbnailBlock";
import TrustIndicator from "@/components/Shared/TrustIndicator";

import { PREVIEW_MODAL_ID } from "@/constants/modal-preview";
import { useAnimatedVisibility } from "@/hooks/useAnimatedVisibility";
import { templatesApi } from "@/services/templatesApi";
import { transformTemplate } from "@/utils/template-transformer";

import styles from "./DetailModal.module.scss";

interface DetailModalProps {
  isOpen: boolean;
  templateId: number;
  onClose: () => void;
}

const DetailModal = ({ isOpen, templateId, onClose }: DetailModalProps) => {
  const { shouldRender, animState } = useAnimatedVisibility(isOpen, 280);

  const {
    data: template,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.getTemplateById(templateId),
    enabled: !!templateId,
    select: ({ template }) => transformTemplate(template),
  });

  if (!shouldRender) return null;

  const dataState = animState === "closing" ? "closing" : undefined;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div
        className={styles.overlay}
        data-state={dataState}
        onClick={handleOverlayClick}
      >
        <div className={styles.modal}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading template details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div
        className={styles.overlay}
        data-state={dataState}
        onClick={handleOverlayClick}
      >
        <div className={styles.modal}>
          <div className={styles.errorContainer}>
            <h3>Unable to load template</h3>
            <p>Please try again later</p>
            <button className={styles.retryButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { ...info } = template;
  const hasTimeSensitiveGrouping = info.timeSensitiveGrouping.length > 0;

  const renderGroupIcon = () => {
    const badges = [
      {
        isDisplay: template.eSignCompatible,
        tooltipKind: LUMIN_BADGES_TYPES.LUMIN_SIGN,
        alt: `${template.title} eSign compatible`,
      },
      {
        isDisplay: template.legalReview,
        tooltipKind: LUMIN_BADGES_TYPES.LEGAL_WRITER,
        alt: `${template.title} legal writer`,
      },
    ];

    return (
      <div className={styles.groupIcon}>
        {badges.map(({ isDisplay, tooltipKind, alt }) => (
          <TemplateDetailBadge
            key={alt}
            isDisplay={isDisplay}
            tooltipKind={tooltipKind}
            alt={alt}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={styles.overlay}
      data-state={dataState}
      onClick={handleOverlayClick}
    >
      <div className={styles.modal} id={PREVIEW_MODAL_ID}>
        <div className={styles.thumbnailContainer}>
          <div className={styles.infoSection}>
            <InformationBlock
              info={info}
              isShowRevisionIndicator={
                hasTimeSensitiveGrouping && template.availableForQuery
              }
            />
          </div>
          <div
            id="trust-indicator-section"
            className={styles.trustIndicatorSection}
          >
            <div className={styles.verticalBar} />
            <TrustIndicator />
            {renderGroupIcon()}
          </div>
          <div className={styles.thumbnailSection}>
            <ThumbnailBlock id={template.id} thumbnails={template.thumbnails} />
          </div>
        </div>
        {hasTimeSensitiveGrouping && (
          <TemplateRevisions
            title={template.title}
            timeSensitiveGrouping={template.timeSensitiveGrouping}
            isPreviewModal={true}
          />
        )}
      </div>
    </div>
  );
};

export default DetailModal;
