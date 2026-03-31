import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flag,
  LayoutTemplate,
  MousePointerClick,
  Pencil,
  Search,
  Share2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  "pencil-simple-line-lg": Pencil,
  "x-md": X,
  "x-lg": X,
  "logo-template-md": LayoutTemplate,
  "search-lg": Search,
  "chevron-down-md": ChevronDown,
  chevron_down: ChevronDown,
  "chevron-left-lg": ChevronLeft,
  "chevron-left-xl": ChevronLeft,
  "chevron-right-lg": ChevronRight,
  "chevron-right-xl": ChevronRight,
  "check-md": Check,
  "check-circle-filled-lg": CheckCircle2,
  click: MousePointerClick,
  "external-link": ExternalLink,
  "ph-share-fat": Share2,
  "flag-md": Flag,
};

const SIZE_MAP: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

interface AppIconProps {
  type: string;
  size?: string | number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function AppIcon({ type, size = "md", color, className, style }: AppIconProps) {
  const Icon = ICON_MAP[type];
  if (!Icon) {
    console.warn(`AppIcon: unknown icon type "${type}"`);
    return null;
  }

  const pxSize = typeof size === "number" ? size : (SIZE_MAP[size] ?? 20);

  return (
    <Icon
      size={pxSize}
      color={color}
      className={className}
      style={style}
    />
  );
}
