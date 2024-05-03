"use client";

import { SVGAttributes, memo, useEffect } from "react";
import { PLOT_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { PieChartProps } from "../../types";

const PieChartPlot = memo(function PieChartPlot({ children, dataKey, ...props }: Pick<PieChartProps, "dataKey"> & SVGAttributes<SVGGElement>) {
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

  // console.log("PieChartPlot");

  return <g className={PLOT_CLASS} transform={`translate(${width / 2}, ${height / 2})`} style={{ outline: "none" }} {...props} />;
});

export default PieChartPlot;
