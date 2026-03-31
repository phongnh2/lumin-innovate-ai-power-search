type Prettify<T> = {
  [K in keyof T]: T[K];
} & Record<string, never>;

export type Alignment = 'start' | 'end';
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Prettify<Side | AlignedPlacement>;
export type Axis = 'x' | 'y';
export type Coords = { [key in Axis]: number };
export type Length = 'width' | 'height';
export type Dimensions = { [key in Length]: number };
export type Rect = Prettify<Coords & Dimensions>;
export type OverflowsData = Array<{
  placement: Placement;
  overflows: Array<number>;
}>;
export type ReferenceElement = unknown;
export type FloatingElement = HTMLElement;

export interface Elements {
  reference: ReferenceElement;
  floating: FloatingElement;
}

export interface MiddlewareState {
  x: number;
  y: number;
  placement?: Placement;
  middlewareData: MiddlewareData;
  elements: Elements;
  rects: ElementRects;
}

export interface ElementRects {
  reference: Rect;
  floating: Rect;
}

export interface MiddlewareData {
  flip?: {
    index?: number;
    overflows: OverflowsData;
  };
  offset?: Coords & { placement: Placement };
}
