import { Category } from "@/components/Category";
import { ChipColor, ChipSize } from "@/components/Chip/constants";

import styles from "./Categories.module.scss";

interface CategoryItem {
  name: string;
  slug: string;
}

export interface CategoriesProps {
  categories?: CategoryItem[];
  primaryTaskCategory?: string;
  primaryIndustryCategory?: string;
  categoryChipColor: ChipColor;
  categoryChipSize?: ChipSize;
}

const Categories = ({
  categories = [],
  primaryTaskCategory = "",
  primaryIndustryCategory = "",
  categoryChipColor,
  categoryChipSize = ChipSize.SMALL,
}: CategoriesProps) => {
  const getCategoryTagList = () => {
    if (!primaryTaskCategory && !primaryIndustryCategory) {
      return [categories[0]?.name];
    }
    return Array.from(
      new Set([primaryIndustryCategory, primaryTaskCategory]),
    ).filter(Boolean);
  };

  const [firstTagName, secondTagName] = getCategoryTagList();

  if (!categories.length || !firstTagName) {
    return null;
  }

  return (
    <div className={styles.containerBadge}>
      <div className={styles.firstChip}>
        <Category.Chip
          name={firstTagName}
          categoryChipColor={categoryChipColor}
          categoryChipSize={categoryChipSize}
        />
      </div>
      {secondTagName && (
        <div className={styles.secondChip}>
          <Category.Chip
            name={secondTagName}
            categoryChipColor={categoryChipColor}
            categoryChipSize={categoryChipSize}
          />
        </div>
      )}
    </div>
  );
};

export default Categories;
