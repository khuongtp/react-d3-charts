"use client";

import { axisRight } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { memo, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { RADIAL_AXIS_CLASS, RADIAL_AXIS_LABELS_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { RadialAxisProps } from "../../types";

const RadialAxis = memo(function ({ dataKey, axisId = "axis0", tickCount = 10, axisLabel }: RadialAxisProps) {
  const axisLineRef = useRef<SVGGElement | null>(null);
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const data = useChartStore((state) => {
    return state.data;
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
  const scale = useChartStore((state) => {
    return state.axes[axisId]?.scale;
  });
  const domain = useChartStore((state) => {
    return state.axes[axisId]?.domain;
  });
  const setAxes = useChartStore((state) => {
    return state.setAxes;
  });

  const largestRadius = useMemo(() => {
    if (!width || !height) {
      return;
    }
    return Math.min(width, height) / 2 - (padding ?? 0);
  }, [height, padding, width]);

  useEffect(() => {
    if (!axisLineRef.current || !largestRadius || !scale) {
      return;
    }
    select(axisLineRef.current)
      .call(axisRight(scale).ticks(tickCount))
      .call((g) => {
        g.attr("transform", `translate(0,${-largestRadius})`);
      });
  }, [largestRadius, scale, tickCount]);

  useEffect(() => {
    if (!domain || !largestRadius) {
      return;
    }
    setAxes({
      [axisId]: {
        scale: scaleLinear().domain(domain).range([largestRadius, 0]),
      },
    });
  }, [axisId, domain, largestRadius, setAxes]);

  if (!data?.length || !width || !height || !scale || !domain || !largestRadius) {
    return null;
  }

  const startAngle = -0.5 * Math.PI;
  const theta = (2 * Math.PI) / data.length;
  const step = (domain[1] - domain[0]) / (tickCount - 1);

  // console.log("RadialAxis");

  return createPortal(
    <g>
      {Array(tickCount)
        .fill(undefined)
        .map((_, i) => {
          const radius = scale(i * step) ?? 0;
          if (!radius) {
            return null;
          }
          return (
            <polygon
              key={i}
              fill="transparent"
              stroke="currentColor"
              points={data
                .map((_, j) => {
                  return `${Math.cos(startAngle + theta * j) * radius},${Math.sin(startAngle + theta * j) * radius}`;
                })
                .join(" ")}
            />
          );
        })}
      <g ref={axisLineRef} />
      {createPortal(
        data.map((item, index) => {
          const radius = largestRadius + (padding ?? 0) / 2;
          const angle = startAngle + theta * index;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: Math.cos(angle) * radius + "px",
                top: Math.sin(angle) * radius + "px",
                transform: `translate(-50%, -50%)`,
                width: padding,
                height: padding,
              }}
            >
              {axisLabel ? axisLabel({ label: item[dataKey], angle: angle, index: index }) : item[dataKey]}
            </div>
          );
        }),
        document.querySelector(`#${chartId} .${RADIAL_AXIS_LABELS_CLASS}`)!,
      )}
    </g>,
    document.querySelector(`#${chartId} .${RADIAL_AXIS_CLASS}`)!,
  );
});

export default RadialAxis;
