import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { AppIcon } from "./app-icon";

const SIZE_CLASSES: Record<string, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors hover:bg-[var(--kiwi-colors-surface-container-low)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer",
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      <AppIcon type={icon} size={size} />
    </button>
  ),
);
IconButton.displayName = "IconButton";

export { IconButton };
