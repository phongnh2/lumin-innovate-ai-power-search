import { MiddlewareState } from './ScrollableMenu.types';

const EXCEED_POSIBLE_POSITION_COUNT = 2;
const OVERFLOW_OFFSET_VALUE = 6; // px

const getPopoverHeight = (state: MiddlewareState) => state.rects.floating.height;

const hasExceedPosiblePostitions = (state: MiddlewareState) =>
  state.middlewareData.flip?.overflows?.length >= EXCEED_POSIBLE_POSITION_COUNT;

export const computeOverflowMaxHeight = (state: MiddlewareState) => {
  const overflowsData = state.middlewareData.flip?.overflows || [];
  const placementOverflowsData = overflowsData.find((item) => item.placement === state.placement);

  if (!placementOverflowsData || !hasExceedPosiblePostitions(state)) {
    return 'auto';
  }

  const { overflows = [] } = placementOverflowsData;
  const [overflowedPixels] = overflows;

  if (!overflowedPixels) {
    return 'auto';
  }

  const popoverHeight = getPopoverHeight(state);

  return `calc(${popoverHeight}px - ${overflowedPixels}px - ${OVERFLOW_OFFSET_VALUE}px)`;
};
