"use client";

import { memo, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { PLOT_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { RingProps } from "../../types";
import { ChartContext } from "../ChartProvider";

const Ring = memo(function ({ dataKey, axisId = "axis0", dots, ...props }: RingProps) {
  const store = useContext(ChartContext);
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const data = useChartStore((state) => {
    return state.data;
  });
  const scale = useChartStore((state) => {
    return state.axes[axisId]?.scale;
  });
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const padding = useChartStore((state) => {
    return state.padding;
  });
  const setAxes = useChartStore((state) => {
    return state.setAxes;
  });

  useEffect(() => {
    if (!data?.length) {
      return;
    }
    const currentMaxDomain = store?.getState().axes[axisId]?.domain?.[1] ?? 0;
    const max = Math.max(
      currentMaxDomain,
      Math.max(
        ...data.map((item) => {
          return item[dataKey];
        }),
      ),
    );
    if (max === currentMaxDomain) {
      return;
    }
    setAxes({
      [axisId]: {
        domain: [0, max],
      },
    });
  }, [axisId, data, dataKey, setAxes, store]);

  if (!data?.length || !width || !height || !scale) {
    return null;
  }

  // console.log("Ring");

  const startAngle = -0.5 * Math.PI;
  const theta = (2 * Math.PI) / data.length;
  const vertices = data.map((item, index) => {
    const radius = Math.min(width, height) / 2 - (scale(item[dataKey]) ?? 0) - (padding ?? 0);
    return { x: Math.cos(startAngle + theta * index) * radius, y: Math.sin(startAngle + theta * index) * radius };
  });

  return createPortal(
    <g className="ring">
      <polygon
        points={vertices
          .map(({ x, y }) => {
            return `${x},${y}`;
          })
          .join(" ")}
        {...props}
      />
      {dots && (
        <g>
          {vertices.map((item, index) => {
            return <circle key={index} cx={item.x} cy={item.y} r={3} />;
          })}
        </g>
      )}
    </g>,
    document.getElementById(chartId)!.getElementsByClassName(PLOT_CLASS)[0],
  );
});

export default Ring;
