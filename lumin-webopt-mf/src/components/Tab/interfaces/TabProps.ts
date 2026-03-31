import { TabPosition } from "./Tab.enum";

export type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  id: string;
  label: string;
  isActive?: boolean;
  position?: TabPosition;
  className?: string;
};
