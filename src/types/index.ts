import { AxisDomain, AxisScale } from "d3-axis";
import { PieArcDatum } from "d3-shape";
import { ReactElement, ReactNode, SVGAttributes } from "react";

export type TooltipProps = { mode?: "hover" | "click"; render: ReactElement | (() => ReactNode) };

export type BarProps = {
  render?: ReactElement | ((props: SVGAttributes<SVGRectElement>) => ReactNode);
  stackId?: string;
} & SVGAttributes<SVGRectElement> &
  SeriesProps;

export type VerticalAxisProps = AxisProps & {
  tickFormatter?: (domainValue: AxisDomain, index: number) => string;
  orientation?: "left" | "right";
  tickCount?: number;
};

export type Curve =
  | "basis"
  | "basisClosed"
  | "basisOpen"
  | "bumpX"
  | "bumpY"
  | "bump"
  | "linear"
  | "linearClosed"
  | "natural"
  | "monotoneX"
  | "monotoneY"
  | "step"
  | "stepBefore"
  | "stepAfter";

export type LineProps = SVGAttributes<SVGPathElement> & {
  dot?: boolean | ReactElement | ((props: SVGAttributes<SVGElement>) => ReactNode);
  curve?: Curve;
} & SeriesProps;

export type PieChartProps = { data: Record<string, string | number>[]; dataKey: string } & SVGAttributes<SVGSVGElement>;

export type CartesianChartProps = {
  data: Record<string, number | string>[];
  layout?: "horizontal" | "vertical";
  scaleExtent?: [number, number];
} & SVGAttributes<SVGSVGElement>;

export type RadialAxisLabelProps = { label: string; angle: number; index: number };

export type RadialAxisProps = {
  dataKey: string;
  axisId?: string;
  tickCount?: number;
  axisLabel?: ({ label, angle, index }: RadialAxisLabelProps) => ReactNode;
};

export type RingProps = { dataKey: string; axisId?: string; dots?: boolean } & SVGAttributes<SVGPolygonElement>;

export type SliceProps = {
  dataIndex: number;
} & SVGAttributes<SVGPathElement>;

export type HorizontalAxisProps = AxisProps & {
  interval?: "preserveStart" | "preserveEnd" | "preserveStartEnd" | "equidistantPreserveStart" | number;
  minTickGap?: number;
  tickLabelWidth?: number;
  orientation?: "bottom" | "top";
} & SVGAttributes<SVGGElement>;

export type AxisProps = {
  dataKey?: string;
  tickSize?: number;
  axisId?: string;
  hidden?: boolean;
  tickPadding?: number;
  gridLines?: boolean;
  startDomainModifier?: (startDomain: number) => number;
  endDomainModifier?: (endDomain: number) => number;
};

export type CartesianChartSeriesProps = { xAxisId?: AxisProps["axisId"]; yAxisId?: AxisProps["axisId"] };

export type SeriesProps = { dataKey: string } & CartesianChartSeriesProps;

export type AxisState = {
  domain?: number[];
  dimension?: "x" | "y";
  dataRange?: [number, number];
  scale?: AxisScale<any>;
};

export type ChartStore = {
  type: "cartesian" | "pie" | "radar";
  axes: Record<string, AxisState>;
  chartId: string;
  data?: Record<string, any>[];
  width?: number;
  height?: number;
  isCursorInside?: boolean;
  isTooltipHovered?: boolean;
  isTooltipLocked?: boolean;
  activeIndex?: number;
  tooltipCursorX?: number;
  tooltipCursorY?: number;
  isReady?: boolean;
  setAxes: (axes: Record<string, AxisState>) => void;
};

export type CartesianChartStore = ChartStore & {
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  transform?: { k: number; x: number; y: number };
  clipPathId?: string;
  fullHeightClipPathId?: string;
  stacks?: Record<string, Record<string, string[]>>;
};

export type PieChartStore = ChartStore & { pie?: PieArcDatum<Record<string, any>>[]; tooltipMode?: "hover" | "click" };

export type RadarChartStore = ChartStore & { padding?: number };
