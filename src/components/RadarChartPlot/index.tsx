"use client";

import { SVGAttributes, memo, useEffect } from "react";
import { PLOT_CLASS, RADIAL_AXIS_CLASS, TOOLTIP_CURSOR_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";

const RadarChartPlot = memo(function ({ children, ...props }: SVGAttributes<SVGGElement>) {
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const setChartState = useSetChartState();

  useEffect(() => {
    if (!width || !height) {
      return;
    }
    setChartState({ isReady: true });
  }, [height, setChartState, width]);

  if (!width || !height) {
    return null;
  }

  return (
    <g className={PLOT_CLASS} transform={`translate(${width / 2}, ${height / 2})`} style={{ outline: "none" }} {...props}>
      <g className={TOOLTIP_CURSOR_CLASS} />
      <g className={RADIAL_AXIS_CLASS} style={{ outline: "none" }} />
    </g>
  );
});

export default RadarChartPlot;
