import { IconButton } from "@/components/ui/icon-button";
import clsx from "clsx";
import { isUndefined } from "lodash-es";

import SkeletonThumbnail from "@/components/Skeleton/SkeletonThumbnail/SkeletonThumbnail";
import { Template } from "@/components/Template";

import type { IThumbnail } from "@/interfaces/thumbnail.interface";

import styles from "./MainThumbnail.module.scss";

interface IProps {
  thumbnails: IThumbnail[];
  activeIndex: number | undefined;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const MainThumbnail = ({ thumbnails, activeIndex, setActiveIndex }: IProps) => {
  const isStart = activeIndex === 0;
  const isEnd = activeIndex === thumbnails.length - 1;
  const shouldShowArrows = thumbnails.length > 1;

  const onPrev = () => {
    if (!isStart) {
      setActiveIndex((prev) => Number(prev) - 1);
    }
  };

  const onNext = () => {
    if (!isEnd) {
      setActiveIndex((prev) => Number(prev) + 1);
    }
  };

  const renderSliderItems = () => {
    if (isUndefined(activeIndex)) {
      return (
        <div>
          <SkeletonThumbnail loading={false} noBottom />
        </div>
      );
    }

    return thumbnails.map((thumb, index) => {
      const thumbnailAlt =
        thumb.alt ?? `Large thumbnail of ${thumb.templateName}`;

      return (
        <div
          key={index}
          className={clsx([
            styles.sliderItem,
            activeIndex === index && styles.sliderItemActive,
          ])}
          data-index={index}
        >
          <Template.Thumbnail src={thumb.src} alt={thumbnailAlt} />
        </div>
      );
    });
  };

  const renderArrows = () => (
    <>
      <IconButton
        icon="chevron-left-lg"
        size="lg"
        className={clsx(styles.arrow, styles.arrowLeft)}
        onClick={onPrev}
        aria-label="Previous thumbnail"
      />
      <IconButton
        icon="chevron-right-lg"
        size="lg"
        className={clsx(styles.arrow, styles.arrowRight)}
        onClick={onNext}
        aria-label="Next thumbnail"
      />
    </>
  );

  return (
    <div className={styles.mainSliderContainer}>
      <div>{renderSliderItems()}</div>
      {shouldShowArrows && renderArrows()}
      {!isUndefined(activeIndex) && (
        <div className={styles.pagingContainer}>
          <span>{activeIndex + 1}</span>/<span>{thumbnails.length}</span>
        </div>
      )}
    </div>
  );
};

export default MainThumbnail;
