import { IconButton } from "@/components/ui/icon-button";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { memo, useMemo } from "react";

import ESignCompatibleImage from "@/assets/images/svg/eSign_compatible_2.svg?url";
import LegalWriterImage from "@/assets/images/svg/legal-writer-icon-badge.svg?url";

import { Tab, TabPosition } from "@/components/Tab";
import { Template } from "@/components/Template";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useEmblaCarouselControls } from "@/hooks/useEmblaCarouselControls";
import { useRevisionSelection } from "@/hooks/useRevisionSelection";
import type { ITemplateTimeSensitiveGrouping } from "@/interfaces/template.interface";
import { checkOverlayPosition } from "@/utils/checkOverlayPosition";
import { transformTemplateRevisionNavigate } from "@/utils/filter-transformer";

import {
  MIN_SLIDES_FOR_FULL_FLEX,
  VERSION_INDICATOR_ID_PREVIEW_MODAL,
} from "../RevisionIndicator/constants";
import UsedTime from "../UsedTime";
import UseTemplateButton from "../UseTemplateButton";

import styles from "./TemplateRevisions.module.scss";

interface TemplateRevisionsProps {
  title: string;
  timeSensitiveGrouping: ITemplateTimeSensitiveGrouping[];
  isPreviewModal: boolean;
  isMobileApp?: boolean;
  onDocumentSelect?: (documentId: string) => void;
  onUseTemplate?: () => void;
}

const TemplateRevisions = memo(
  ({
    timeSensitiveGrouping = [],
    title,
    isMobileApp = false,
  }: TemplateRevisionsProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      align: "start",
    });
    const breakpoint = useBreakpoint();
    const { canScrollNext, canScrollPrev, scrollNext, scrollPrev } =
      useEmblaCarouselControls(emblaApi);

    const { handleRevisionSelect, currentRevision } = useRevisionSelection(
      timeSensitiveGrouping,
    );

    const totalSlides = timeSensitiveGrouping.length;

    const isFullFlex = useMemo(
      () =>
        (breakpoint === "desktop" &&
          totalSlides <= MIN_SLIDES_FOR_FULL_FLEX.desktop) ||
        (breakpoint === "tablet" &&
          totalSlides <= MIN_SLIDES_FOR_FULL_FLEX.tablet) ||
        (breakpoint === "mobile" &&
          totalSlides <= MIN_SLIDES_FOR_FULL_FLEX.mobile),
      [breakpoint, totalSlides],
    );

    const scrollToAvoidOverlay = (
      index: number,
      isUnderLeftOverlay: boolean,
      isUnderRightOverlay: boolean,
    ) => {
      if (!emblaApi) {
        return;
      }

      if (isUnderLeftOverlay) {
        emblaApi.scrollTo(Math.max(0, index - 1));
        return;
      }

      if (isUnderRightOverlay) {
        const currentIndex = emblaApi.selectedScrollSnap();
        emblaApi.scrollTo(Math.min(currentIndex + 1, index + 1));
        return;
      }
    };

    const handleTabClick = (id: string, index: number) => {
      handleRevisionSelect(id);

      if (!emblaApi || isFullFlex) {
        return;
      }

      const slides = emblaApi.slideNodes();
      const viewport = emblaApi.rootNode();
      const targetSlide = slides[index];

      if (!targetSlide || !viewport) {
        return;
      }

      const slideRect = targetSlide.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const { isUnderLeftOverlay, isUnderRightOverlay } = checkOverlayPosition({
        slideRect,
        viewportRect,
        canScrollPrev,
        canScrollNext,
      });

      scrollToAvoidOverlay(index, isUnderLeftOverlay, isUnderRightOverlay);
    };

    return (
      <div className={styles.container}>
        <div
          className={styles.templateContainer}
          id={VERSION_INDICATOR_ID_PREVIEW_MODAL}
        >
          <h2 className={styles.templateHeader}>Other {title} revisions</h2>
          <div
            className={clsx(
              styles.timeSelectorWrapper,
              canScrollNext && styles.showOverlayRight,
              canScrollPrev && styles.showOverlayLeft,
            )}
          >
            <div className={styles.timeSelectorViewport} ref={emblaRef}>
              <div className={styles.timeSelectorContainer}>
                {timeSensitiveGrouping.map(({ id, publishedDate }, index) => (
                  <Tab
                    key={id}
                    id={id}
                    label={publishedDate}
                    className={clsx(
                      styles.timeSelectorSlide,
                      isFullFlex && styles.isFullFlex,
                    )}
                    position={TabPosition.Vertical}
                    isActive={currentRevision.id === id}
                    onClick={() => handleTabClick(id, index)}
                  />
                ))}
              </div>
            </div>
            {canScrollPrev && (
              <IconButton
                className={clsx(styles.arrowButton, styles.arrowButtonLeft)}
                icon="chevron_left"
                size="md"
                iconSize="md"
                onClick={scrollPrev}
              />
            )}
            {canScrollNext && (
              <IconButton
                className={clsx(styles.arrowButton, styles.arrowButtonRight)}
                icon="chevron_right"
                size="md"
                iconSize="md"
                onClick={scrollNext}
              />
            )}
          </div>
          <div className={styles.thumbnailWrapper}>
            <div className={styles.thumbnailContainer}>
              <Template.Thumbnail
                key={`${currentRevision?.id}-${currentRevision?.mainThumbnail?.url}`}
                className={styles.thumbnailPreview}
                src={currentRevision?.mainThumbnail?.url}
                alt={
                  currentRevision?.mainThumbnail?.alt ??
                  currentRevision?.title ??
                  "Document Preview"
                }
                style={{ aspectRatio: "var(--thumbnail-aspect)" }}
              />
              {!isMobileApp && (
                <div className={styles.groupIcon}>
                  {currentRevision?.eSignCompatible && (
                    <img
                      className={styles.groupIconImage}
                      src={ESignCompatibleImage}
                      alt={title}
                    />
                  )}
                  {currentRevision?.legalReview && (
                    <img
                      className={styles.groupIconImage}
                      src={LegalWriterImage}
                      alt={title}
                    />
                  )}
                </div>
              )}
            </div>
            <div className={styles.bottomAction}>
              <UsedTime
                usedTime={currentRevision?.totalUsed}
                spacingIcon={4}
                iconFixedSize
                fixedMarginBottom
              />
              <UseTemplateButton
                isFullWidth
                {...transformTemplateRevisionNavigate(currentRevision)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default TemplateRevisions;
