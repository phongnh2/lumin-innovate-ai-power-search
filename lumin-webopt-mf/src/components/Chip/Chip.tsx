import { forwardRef, type HTMLAttributes } from "react";

import { ChipColor, ChipSize } from "./constants";

import styles from "./Chip.module.scss";

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  color?: ChipColor;
  size?: ChipSize;
  label: string;
}

const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      color = ChipColor.LUMIN_GROWTH,
      size = ChipSize.SMALL,
      label,
      ...otherProps
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={styles.chip}
      data-color={color}
      data-size={size}
      {...otherProps}
    >
      <span className={styles.label}>{label}</span>
    </div>
  ),
);

export default Chip;
