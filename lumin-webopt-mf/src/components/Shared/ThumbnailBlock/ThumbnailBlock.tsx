import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

import type { IThumbnail } from "@/interfaces/thumbnail.interface";

import MainThumbnail from "./MainThumbnail";
import ThumbnailNavigation from "./ThumbnailNavigation";

import styles from "./ThumbnailBlock.module.scss";

const ThumbnailBlock = (props: IProps) => {
  const { id, thumbnails } = props;
  const [activeIndex, setActiveIndex] = useState<number | undefined>(() =>
    thumbnails.length ? 0 : undefined,
  );

  useEffect(() => {
    setActiveIndex(thumbnails.length ? 0 : undefined);
  }, [id, thumbnails.length]);

  const onItemClick = (event: MouseEvent<HTMLDivElement>) => {
    const index = event.currentTarget.getAttribute("data-index");
    if (index) {
      setActiveIndex(Number(index));
    }
  };

  return (
    <div>
      <MainThumbnail
        thumbnails={thumbnails}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
      <div className={styles.thumbnailListContainer}>
        <ThumbnailNavigation
          thumbnails={thumbnails}
          onItemClick={onItemClick}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  );
};

interface IProps {
  id: number;
  thumbnails: IThumbnail[];
}

export default ThumbnailBlock;
