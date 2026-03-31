import clsx from "clsx";
import { useCallback } from "react";

import CategoryChip from "@/components/Category/Chip";
import { ChipColor, ChipSize } from "@/components/Chip/constants";

import type { ICategory } from "@/interfaces/category.interface";

import styles from "./PrimaryCategories.module.scss";

const PrimaryCategories = ({
  categories,
  primaryTaskCategory,
  primaryIndustryCategory,
  noMarginTop = false,
}: IProps) => {
  const getCategoryTagList = useCallback((): string[] => {
    if (!primaryTaskCategory && !primaryIndustryCategory) {
      return [categories[0]?.name];
    }
    /**
     * We need to remove duplicated category name from the list
     * because the marketing team may add the same category name
     */
    return Array.from(
      new Set([primaryIndustryCategory, primaryTaskCategory]),
    ).filter(Boolean) as string[];
  }, [categories, primaryIndustryCategory, primaryTaskCategory]);

  const [firstTagName, secondTagName] = getCategoryTagList();

  return (
    !!categories.length && (
      <>
        <div
          className={clsx([
            styles.containerBadge,
            noMarginTop && styles.noMarginTop,
          ])}
        >
          <CategoryChip
            categoryChipColor={ChipColor.LUMIN_GROWTH}
            className={styles.wrapperChip}
            categoryChipSize={ChipSize.SMALL}
            name={firstTagName}
          />
          {secondTagName && (
            <CategoryChip
              categoryChipColor={ChipColor.LUMIN_GROWTH}
              className={clsx([styles.wrapperChip, styles.wrapperChipSecond])}
              categoryChipSize={ChipSize.SMALL}
              name={secondTagName}
            />
          )}
        </div>
      </>
    )
  );
};

interface IProps {
  categories: ICategory[];
  primaryTaskCategory?: string;
  primaryIndustryCategory?: string;
  noMarginTop?: boolean;
  tagSize?: ChipSize;
  eventClickCategory?: string;
}

export default PrimaryCategories;
