import { useState, useEffect, useCallback } from "react";

import type { EmblaCarouselApi } from "@/libs/embla-carousel-react";

export const useEmblaCarouselControls = (
  emblaApi: EmblaCarouselApi | undefined,
) => {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    updateScrollState();
    emblaApi.on("reInit", updateScrollState).on("select", updateScrollState);
    return () => {
      emblaApi
        .off("reInit", updateScrollState)
        .off("select", updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return { canScrollPrev, canScrollNext, scrollPrev, scrollNext };
};
