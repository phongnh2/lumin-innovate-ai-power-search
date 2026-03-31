import { Button } from "@/components/ui/button";

import { getHighResThumbnail } from "@/utils/template";

import styles from "./Item.module.scss";

interface ThumbnailProps {
  src: string;
  alt: string;
  title: string;
}

const Thumbnail = ({ src, alt, title }: ThumbnailProps) => {
  if (!src) {
    return (
      <div className={styles.thumbnailWrapper}>
        <div className={styles.thumbnailPlaceholder}>Lumin</div>
      </div>
    );
  }

  return (
    <div className={styles.thumbnailWrapper}>
      <span className={styles.linkOnTouchDevice}>{title}</span>
      <div className={styles.thumbnailOverlay}>
        <Button size="md">Preview template</Button>
      </div>
      <img
        src={getHighResThumbnail(src)}
        alt={alt || title}
        className={styles.thumbnail}
        onError={(e) => console.log("Image load error:", e)}
        onLoad={() => console.log("Image loaded successfully:", src)}
      />
    </div>
  );
};

export default Thumbnail;
