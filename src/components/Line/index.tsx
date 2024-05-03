"use client";

import { select } from "d3-selection";
import { curveMonotoneX, line } from "d3-shape";
import { SVGAttributes, useContext, useLayoutEffect, useRef } from "react";
import { DEFAULT_X_AXIS_ID } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { LineProps } from "../../types";
import CartesianChartGroup, { GroupContext } from "../CartesianChartGroup";

const Line = ({ dataKey, dot, yAxisId, xAxisId = DEFAULT_X_AXIS_ID, ...props }: LineProps) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const data = useChartStore((state) => {
    return state.data;
  });
  const width = useChartStore((state) => {
    return state.width;
  });
  const xScale = useChartStore((state) => {
    return state.axes[xAxisId]?.scale;
  });
  const dataRange = useChartStore((state) => {
    return state.axes[xAxisId]?.dataRange;
  });
  const xScaleDataKey = "x";
  const yScale = useChartStore((state) => {
    return state.axes[yAxisId!]?.scale;
  });

  useLayoutEffect(() => {
    if (!data?.length || !width || !xScale || !yScale) {
      return;
    }
    select(pathRef.current)
      .datum(dataRange ? data.slice(Math.max(0, dataRange[0] - 1), Math.min(data.length, dataRange[1] + 2)) : data)
      .attr(
        "d",
        line<(typeof data)[number]>()
          .x((d) => {
            return (xScale(d[xScaleDataKey]) ?? 0) + (xScale.bandwidth?.() ?? 0) / 2;
          })
          .y((d) => {
            return yScale(d[dataKey]) ?? 0;
          })
          .curve(curveMonotoneX),
      );
  }, [data, dataKey, dataRange, width, xScale, yScale]);

  if (!data?.length || !width || !xScale || !yScale) {
    return null;
  }

  return (
    <g>
      <path ref={pathRef} fill="none" {...props} />
      {dot &&
        data.map((_, index) => {
          if (dataRange && (index < dataRange[0] || index >= dataRange[1] + 1)) {
            return null;
          }
          return (
            <CartesianChartGroup key={index} dataIndex={index}>
              {typeof dot === "boolean" && <Dot dataIndex={index} dataKey={dataKey} yAxisId={yAxisId!} />}
            </CartesianChartGroup>
          );
        })}
    </g>
  );
};

const Dot = ({
  dataIndex,
  dataKey,
  yAxisId,
  ...props
}: {
  dataKey: string;
  dataIndex: number;
  yAxisId: string;
} & SVGAttributes<SVGCircleElement>) => {
  const { xScale: groupXScale } = useContext(GroupContext);
  const data = useChartStore((state) => {
    return state.data;
  });
  const yScale = useChartStore((state) => {
    return state.axes[yAxisId].scale;
  });

  if (!data?.length || !yScale) {
    return null;
  }

  return <circle r={3} fill="black" transform={`translate(${(groupXScale?.bandwidth?.() ?? 0) / 2},${yScale(data[dataIndex][dataKey])})`} {...props} />;
};

export default Line;
