import styles from "./SkeletonItem.module.scss";

const SkeletonItem = () => (
  <div className={styles.container}>
    <div className={styles.thumbnailWrapper}>
      <div className={styles.thumbnailSkeleton} />
    </div>
    <div className={styles.categoriesSkeleton}>
      <div className={styles.chipSkeleton} />
      <div className={styles.chipSkeleton} />
    </div>
    <div className={styles.titleSkeleton} />
    <div className={styles.descriptionSkeleton} />
  </div>
);

export default SkeletonItem;
