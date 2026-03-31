import { IconButton } from "@/components/ui/icon-button";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";

import SkeletonThumbnail from "@/components/Skeleton/SkeletonThumbnail/SkeletonThumbnail";
import { Template } from "@/components/Template";

import { useEmblaCarouselControls } from "@/hooks/useEmblaCarouselControls.ts";
import type { IThumbnail } from "@/interfaces/thumbnail.interface";
import { getThumbnailAlt } from "@/utils/template";

import styles from "./ThumbnailNavigation.module.scss";

const THUMBNAIL_PER_PAGE = 6;

const ThumbnailNavigation = ({
  thumbnails,
  onItemClick,
  activeIndex,
}: IProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 4,
    breakpoints: {
      [`(min-width: 768px)`]: { slidesToScroll: THUMBNAIL_PER_PAGE },
    },
  });
  const { canScrollNext, canScrollPrev, scrollNext, scrollPrev } =
    useEmblaCarouselControls(emblaApi);

  const renderSliderContent = () => {
    if (thumbnails.length === 0) {
      return (
        <div>
          <SkeletonThumbnail loading={false} noBottom />
        </div>
      );
    }

    return thumbnails.map((thumb, index) => (
      <div
        role="button"
        tabIndex={0}
        key={JSON.stringify(thumb)}
        onClick={onItemClick}
        data-index={index}
      >
        <Template.Thumbnail
          noIcon
          src={thumb.src}
          alt={getThumbnailAlt({
            alt: thumb.alt,
            pageIndex: index,
            templateName: thumb.templateName,
          })}
          className={clsx([
            styles.thumbnailItem,
            index === activeIndex && styles.thumbnailItemActive,
          ])}
        />
      </div>
    ));
  };

  const showArrows = thumbnails.length > THUMBNAIL_PER_PAGE;
  const shouldShowPrev = showArrows && canScrollPrev;
  const shouldShowNext = showArrows && canScrollNext;

  return (
    <div style={{ position: "relative" }}>
      <div className={styles.carouselViewport} ref={emblaRef}>
        <div className={styles.carouselContainer}>{renderSliderContent()}</div>
      </div>
      {shouldShowPrev && (
        <IconButton
          icon="chevron-left-xl"
          className={clsx(styles.arrowButton, styles.arrowButtonLeft)}
          onClick={scrollPrev}
        />
      )}
      {shouldShowNext && (
        <IconButton
          icon="chevron-right-xl"
          className={clsx(styles.arrowButton, styles.arrowButtonRight)}
          onClick={scrollNext}
        />
      )}
    </div>
  );
};

interface IProps {
  thumbnails: IThumbnail[];
  onItemClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  activeIndex: number | undefined;
}

export default ThumbnailNavigation;
