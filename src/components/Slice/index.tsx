"use client";

import { arc } from "d3-shape";
import { memo } from "react";
import { createPortal } from "react-dom";
import { PLOT_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { SliceProps } from "../../types";

const Slice = memo(function Slice({ dataIndex, ...props }: SliceProps) {
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const slice = useChartStore((state) => {
    return state.pie?.[dataIndex];
  });

  if (!slice || !width || !height) {
    return null;
  }

  // console.log("Slice");

  return createPortal(
    <path
      className="slice"
      data-index={dataIndex}
      d={
        arc()({
          endAngle: slice.endAngle,
          innerRadius: 0,
          outerRadius: Math.min(width, height) / 2,
          startAngle: slice.startAngle,
          padAngle: slice.padAngle,
        }) ?? undefined
      }
      {...props}
    />,
    document.getElementById(chartId)!.getElementsByClassName(PLOT_CLASS)[0],
  );
});

export default Slice;
