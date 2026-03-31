import styles from "./SkeletonCard.module.scss";

const SkeletonCard = () => (
  <div className={styles.card}>
    <div className={styles.thumbnailWrapper} />
    <div className={styles.info}>
      <div className={styles.titleSkeleton} />
      <div className={styles.usageSkeleton} />
    </div>
  </div>
);

export default SkeletonCard;
