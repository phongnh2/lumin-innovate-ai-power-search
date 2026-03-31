import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";

import { PREVIEW_MODAL_ID } from "@/constants/modal-preview";

import {
  CTA_BUTTON_HEIGHT,
  VERSION_INDICATOR_ID,
  VERSION_INDICATOR_ID_PREVIEW_MODAL,
} from "./constants";

import styles from "./RevisionIndicator.module.scss";

const HEADER_HEIGHT = 72;

const scrollToElement = (
  element: HTMLElement,
  container: HTMLElement | Window | null,
) => {
  if (!container) {
    return;
  }
  const offset = container === window ? HEADER_HEIGHT : 0;
  const scrollTop = element.offsetTop - offset;

  container.scrollTo({
    top: scrollTop + CTA_BUTTON_HEIGHT,
    left: 0,
    behavior: "smooth",
  });
};

const RevisionIndicator = () => {
  const handleViewOtherRevisions = () => {
    const indicatorElementPreviewModal = document.getElementById(
      VERSION_INDICATOR_ID_PREVIEW_MODAL,
    );

    if (indicatorElementPreviewModal) {
      const previewModalElement = document.getElementById(PREVIEW_MODAL_ID);
      scrollToElement(indicatorElementPreviewModal, previewModalElement);
      return;
    }

    const indicatorElementPage = document.getElementById(VERSION_INDICATOR_ID);
    if (indicatorElementPage) {
      scrollToElement(indicatorElementPage, window);
      return;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.latestRevision}>
        <AppIcon
          type="check-circle-filled-lg"
          className={styles.latestRevisionIcon}
        />
        <span className={styles.latestRevisionText}>Latest revision</span>
      </div>
      <Button
        size="sm"
        color="text"
        className={styles.viewOtherRevisions}
        onClick={handleViewOtherRevisions}
      >
        View other revisions
      </Button>
    </div>
  );
};
export default RevisionIndicator;
