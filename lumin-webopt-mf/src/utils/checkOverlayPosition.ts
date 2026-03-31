import { CAROUSEL_OVERLAY_WIDTH } from "@/components/Shared/RevisionIndicator/constants";

interface CheckOverlayPositionParams {
  slideRect: DOMRect;
  viewportRect: DOMRect;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

export const checkOverlayPosition = ({
  slideRect,
  viewportRect,
  canScrollPrev,
  canScrollNext,
}: CheckOverlayPositionParams) => {
  const isUnderLeftOverlay =
    canScrollPrev &&
    slideRect.left < viewportRect.left + CAROUSEL_OVERLAY_WIDTH;
  const isUnderRightOverlay =
    canScrollNext &&
    slideRect.right > viewportRect.right - CAROUSEL_OVERLAY_WIDTH;

  return { isUnderLeftOverlay, isUnderRightOverlay };
};
