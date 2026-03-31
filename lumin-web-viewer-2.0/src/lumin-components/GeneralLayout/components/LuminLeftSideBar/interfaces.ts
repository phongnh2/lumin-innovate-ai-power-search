export interface ILeftSideBarContentProps {
  onClick: (item: string) => boolean;
}

type SVGComponent = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

export type SideBarIcon = {
  normal: {
    light: SVGComponent;
    dark: SVGComponent;
  };
  active: {
    light: SVGComponent;
    dark: SVGComponent;
  };
};

export interface ILeftSideBarElementProps {
  icon: SideBarIcon;
  value: string;
  label: string;
  toolName?: string;
  eventName?: string;
  dataElement?: string;
  validateMimeType?: boolean;
  allowInTempEditMode: boolean;
  isColorIcon?: boolean;
}
