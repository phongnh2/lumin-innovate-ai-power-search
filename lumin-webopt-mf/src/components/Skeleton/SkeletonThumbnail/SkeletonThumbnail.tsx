import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";

import SvgLogo from "@/assets/images/svg/logo-lumin-shape-grey.svg";

import styles from "./SkeletonThumbnail.module.scss";

interface IProps {
  loading?: boolean;
  noIcon?: boolean;
  noBottom?: boolean;
}

const SkeletonThumbnail = ({ loading, noIcon, noBottom }: IProps) => (
  <div>
    <div className={clsx([styles.container])}>
      {loading ? (
        <div style={{ transform: "scale(1)" }} className={clsx([styles.item])}>
          <Skeleton width="100%" height="100%" />
        </div>
      ) : (
        <div className={styles.item} />
      )}
      {!noIcon && <img src={SvgLogo} className={styles.svg} alt="Lumin logo" />}
    </div>
    {loading && !noBottom && (
      <div>
        <div style={{ display: "flex", marginTop: 8 }}>
          <Skeleton height={20} width={60} style={{ marginRight: 8 }} />
          <Skeleton height={20} width={48} />
        </div>
        <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
        <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
      </div>
    )}
  </div>
);

export default SkeletonThumbnail;
