import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        filled:
          "bg-[var(--kiwi-colors-core-primary)] text-[var(--kiwi-colors-core-on-primary)] shadow-sm hover:shadow-md hover:brightness-[0.97] active:scale-[0.98]",
        elevated:
          "bg-[var(--kiwi-colors-surface-surface)] text-[var(--kiwi-colors-surface-on-surface)] shadow-sm hover:shadow-md hover:bg-[var(--kiwi-colors-surface-container-low)]",
        text: "text-[var(--kiwi-colors-core-primary)] hover:bg-[var(--kiwi-colors-surface-container-low)] active:scale-[0.98]",
        outline:
          "border border-[var(--kiwi-colors-surface-outline-variant)] bg-transparent text-[var(--kiwi-colors-surface-on-surface)] hover:bg-[var(--kiwi-colors-surface-container-low)] hover:border-[var(--kiwi-colors-core-primary)] hover:shadow-sm",
        ghost:
          "text-[var(--kiwi-colors-surface-on-surface)] hover:bg-[var(--kiwi-colors-surface-container-low)] active:scale-[0.98]",
      },
      size: {
        icon: "h-9 w-9 p-0",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-sm",
        xl: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  },
);

export type ButtonSize = "icon" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {startIcon}
        {children}
        {endIcon}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
