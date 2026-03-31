import clsx from "clsx";
import { forwardRef } from "react";

import { TabPosition } from "./interfaces/Tab.enum";
import type { TabProps } from "./interfaces/TabProps";

import styles from "./Tab.module.scss";

const Tab = forwardRef<HTMLButtonElement, TabProps>(
  (
    {
      id,
      label,
      isActive = false,
      position = TabPosition.Horizontal,
      className,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      aria-controls={`${id}-panel`}
      className={clsx(
        styles.tab,
        position === TabPosition.Horizontal && styles.horizontal,
        position === TabPosition.Vertical && styles.vertical,
        isActive && styles.active,
        className,
      )}
      {...props}
    >
      {label}
    </button>
  ),
);

Tab.displayName = "Tab";

export default Tab;
