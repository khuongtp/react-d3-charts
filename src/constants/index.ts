import {
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveBumpX,
  curveBumpY,
  CurveFactory,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from "d3-shape";
import { Curve } from "../types";

export const DEFAULT_X_AXIS_ID = "xAxis0";
export const DEFAULT_Y_AXIS_ID = "yAxis0";
export const HORIZONTAL_AXIS_CLASS = "horizontal-axis";
export const MOUSE_MOVE_DELAY = 100;
export const PLOT_CLASS = "plot";
export const RADIAL_AXIS_CLASS = "radial-axis";
export const RADIAL_AXIS_LABELS_CLASS = "radial-axis-labels";
export const SLICE_CLASS = "slice";
export const TOOLTIP_CLASS = "tooltip";
export const TOOLTIP_CURSOR_CLASS = "tooltip-cursor";
export const VERTICAL_AXIS_CLASS = "vertical-axis";
export const CURVES: Record<Curve, CurveFactory> = {
  basis: curveBasis,
  basisClosed: curveBasisClosed,
  basisOpen: curveBasisOpen,
  bumpX: curveBumpX,
  bumpY: curveBumpY,
  bump: curveBumpY,
  linear: curveLinear,
  linearClosed: curveLinearClosed,
  natural: curveNatural,
  monotoneX: curveMonotoneX,
  monotoneY: curveMonotoneY,
  step: curveStep,
  stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
};
