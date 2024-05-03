"use client";

import { AxisScale } from "d3-axis";
import { scaleBand } from "d3-scale";
import { Children, HTMLAttributes, createContext, useRef } from "react";
import { useChartStore } from "../../hooks/useChartStore";

export const GroupContext = createContext<{ xScale?: AxisScale<number> }>({});

const CartesianChartGroup = ({ children, dataIndex, ...props }: HTMLAttributes<SVGGElement> & { dataIndex: number }) => {
  const thisRef = useRef<SVGGElement | null>(null);
  const data = useChartStore((state) => {
    return state.data;
  });
  const width = useChartStore((state) => {
    return state.width;
  });
  const xScale = useChartStore((state) => {
    return state.axes["xAxis0"]?.scale;
  });
  const xScaleDataKey = "x";

  if (!data?.length || !xScale || !width) {
    return null;
  }

  const x = xScale(data[dataIndex]?.[xScaleDataKey]) ?? 0;
  const bandWidth = xScale.bandwidth?.() ?? 0;

  if (x + bandWidth < 0 || x > width) {
    return null;
  }

  return (
    <GroupContext.Provider
      value={{
        xScale: scaleBand<number>()
          .domain(
            Array(Children.count(children))
              .fill(undefined)
              .map((_, index) => {
                return index;
              }),
          )
          .range([0, bandWidth]),
      }}
    >
      <g ref={thisRef} className="group" transform={`translate(${x},0)`} {...props}>
        {children}
      </g>
    </GroupContext.Provider>
  );
};

export default CartesianChartGroup;
