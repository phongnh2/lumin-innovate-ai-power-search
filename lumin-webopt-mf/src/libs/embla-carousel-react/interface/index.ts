import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

export type EmblaCarouselApi = UseEmblaCarouselType[1];
export type UseEmblaCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type EmblaCarouselOptions = UseEmblaCarouselParameters[0];
export type EmblaCarouselPlugin = UseEmblaCarouselParameters[1];
