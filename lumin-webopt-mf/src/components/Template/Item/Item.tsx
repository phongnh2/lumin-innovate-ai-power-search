import clsx from "clsx";

import { ChipColor } from "@/components/Chip/constants";

import type { ITemplate } from "@/interfaces/template.interface";

import Badge from "../Badge";
import { LUMIN_BADGES_TYPES } from "../Badge/constants";
import Categories from "../Categories";

import Thumbnail from "./Thumbnail";

import styles from "./Item.module.scss";

export interface ItemProps {
  templateData: ITemplate;
  className?: string;
  onClick?: () => void;
}

const Item = ({ templateData, className, onClick }: ItemProps) => {
  if (!templateData) {
    return null;
  }

  const {
    thumbnail,
    categories = [],
    eSignCompatible,
    legalReview,
    title,
    usage,
  } = templateData;

  const renderLuminBadges = () => (
    <div className={styles.iconGroup}>
      <Badge
        isDisplay={Boolean(eSignCompatible)}
        tooltipKind={LUMIN_BADGES_TYPES.LUMIN_SIGN}
        alt={`${title} eSign compatible`}
      />
      <Badge
        isDisplay={Boolean(legalReview)}
        tooltipKind={LUMIN_BADGES_TYPES.LEGAL_WRITER}
        alt={`${title} legal writer`}
      />
    </div>
  );

  return (
    <div className={clsx(styles.container, className)} onClick={onClick}>
      {renderLuminBadges()}
      <div>
        <Thumbnail src={thumbnail} alt={title} title={title} />
        <Categories
          categories={categories.map((category) => ({
            name: category.name,
            slug: category.slug,
          }))}
          primaryIndustryCategory={categories[0]?.name ?? ""}
          primaryTaskCategory={categories[1]?.name ?? ""}
          categoryChipColor={ChipColor.LUMIN_GROWTH}
        />
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{usage}</p>
      </div>
    </div>
  );
};

export default Item;
