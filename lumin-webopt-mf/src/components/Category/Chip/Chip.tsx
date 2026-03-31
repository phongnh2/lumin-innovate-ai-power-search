import clsx from "clsx";
import { forwardRef } from "react";

import Chip from "@/components/Chip";
import { ChipColor, ChipSize } from "@/components/Chip/constants";
import Tooltip from "@/components/Tooltip";

import styles from "./Chip.module.scss";

const TOOLTIP_DELAY_TIME = 1000;

export interface CategoryChipProps {
  name: string;
  categoryChipColor: ChipColor;
  categoryChipSize?: ChipSize;
  className?: string;
}

const CategoryChip = forwardRef<HTMLSpanElement, CategoryChipProps>(
  (
    { name, categoryChipColor, categoryChipSize = ChipSize.SMALL, className },
    ref,
  ) => (
    <Tooltip content={name} delayShow={TOOLTIP_DELAY_TIME}>
      <span ref={ref} className={clsx(styles.link, className)}>
        <Chip label={name} color={categoryChipColor} size={categoryChipSize} />
      </span>
    </Tooltip>
  ),
);

export default CategoryChip;
