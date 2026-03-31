import clsx from "clsx";
import { memo, useCallback, useState } from "react";

import SkeletonThumbnail from "@/components/Skeleton/SkeletonThumbnail/SkeletonThumbnail";

import { getHighResThumbnail } from "@/utils/template";

import styles from "./Thumbnail.module.scss";

const Thumbnail = ({
  src,
  alt = "",
  sizes,
  noIcon = false,
  className,
}: IProps) => {
  const [error, setError] = useState(false);

  const onLoadFailed = useCallback(() => setError(true), []);

  const renderImage = () => {
    if (!src || error) {
      return <SkeletonThumbnail loading={false} noIcon={noIcon} />;
    }

    return (
      <div className={styles.thumbnailContainer}>
        <img
          className={styles.thumbnailImage}
          src={getHighResThumbnail(src)}
          alt={alt}
          sizes={sizes}
          onError={onLoadFailed}
        />
      </div>
    );
  };

  return (
    <div className={clsx([styles.container, className])}>{renderImage()}</div>
  );
};

interface IProps {
  src: string;
  alt: string;
  noBorder?: boolean;
  noIcon?: boolean;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default memo(Thumbnail);
