"use client";

import { AxisDomain, axisBottom, axisTop } from "d3-axis";
import { scaleBand } from "d3-scale";
import { select } from "d3-selection";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { DEFAULT_X_AXIS_ID, HORIZONTAL_AXIS_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { HorizontalAxisProps } from "../../types";

const HorizontalAxis = forwardRef<SVGGElement, HorizontalAxisProps>(function XAxis(
  {
    tickSize = 6,
    dataKey,
    interval = "preserveEnd",
    minTickGap = 5,
    hidden,
    axisId = DEFAULT_X_AXIS_ID,
    tickPadding = 3,
    tickLabelWidth,
    orientation = "bottom",
    gridLines,
    ...props
  },
  ref,
) {
  const thisRef = useRef<SVGGElement | null>(null);
  const gridLinesRef = useRef<SVGGElement | null>(null);
  const data = useChartStore((state) => {
    return state.data;
  });
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const marginLeft = useChartStore((state) => {
    return state.marginLeft;
  });
  const marginRight = useChartStore((state) => {
    return state.marginRight;
  });
  const scale = useChartStore((state) => {
    return state.axes[axisId]?.scale;
  });
  const clipPathId = useChartStore((state) => {
    return state.clipPathId;
  });
  const setChartState = useSetChartState();
  const setAxes = useChartStore((state) => {
    return state.setAxes;
  });

  const dataRange: [number, number] | undefined = useMemo(() => {
    if (!scale || !width) {
      return undefined;
    }
    const range = scale.range();
    const domain = scale.domain();
    const groupWidth = (range[1] - range[0]) / domain.length;
    return [Math.max(0, Math.floor((0 - range[0]) / groupWidth)), Math.floor((width - (marginLeft ?? 0) - (marginRight ?? 0) - range[0]) / groupWidth)];
  }, [marginLeft, marginRight, scale, width]);

  const tickValues = useMemo(() => {
    if (!data || !dataKey || !width) {
      return;
    }
    const dataInView = dataRange ? data.slice(dataRange[0], dataRange[1] + 1) : data;
    let tickValues = dataInView.map((item) => {
      return item[dataKey];
    });
    if (typeof interval === "number") {
      for (let i = data?.length - 1; i > 0; i -= interval) {
        tickValues.unshift(data[i][dataKey]);
      }
    } else if (tickLabelWidth) {
      const skipEvery = Math.max(
        1,
        Math.round((tickLabelWidth * tickValues.length) / width), // How many x times the scale should be wider
      );
      tickValues = data
        .map((item) => {
          return item[dataKey];
        })
        .filter((_, index) => {
          // Then we comb the tick values to make it x times shorter
          return index % skipEvery === 0;
        });
    }
    return tickValues;
  }, [data, dataKey, dataRange, interval, tickLabelWidth, width]);

  useEffect(() => {
    if (!gridLines || !gridLinesRef.current || !scale || !height || !tickValues || !dataRange) {
      return;
    }
    select(gridLinesRef.current)
      .call(
        axisBottom(scale)
          .tickSizeOuter(0)
          .tickSizeInner(height)
          .tickFormat(() => {
            return "";
          })
          .tickValues(tickValues),
      )
      .call((g) => {
        g.attr("transform", `translate(${marginLeft ?? 0},0)`);
        g.select(".domain").remove();
        g.selectAll(".tick text").remove();
      });
  }, [dataRange, gridLines, height, marginLeft, scale, tickValues]);

  useEffect(() => {
    if (!thisRef.current || !scale || !width || !height || !tickValues) {
      return;
    }
    let axis;
    switch (orientation) {
      case "bottom":
        axis = axisBottom(scale);
        break;
      case "top":
        axis = axisTop(scale);
        break;
    }
    axis = axis.tickPadding(tickPadding).tickSizeInner(tickSize).tickSizeOuter(0).tickValues(tickValues);
    select(thisRef.current)
      .call(axis)
      .call((g) => {
        const svg = g.node()?.ownerSVGElement;
        if (!svg) {
          return;
        }
        const thisHeight = g.node()?.getBoundingClientRect().height ?? 0;
        let totalHeight = 0;
        for (const item of svg.querySelectorAll(`.${HORIZONTAL_AXIS_CLASS}.${orientation}`)) {
          totalHeight += item.getBoundingClientRect().height;
        }
        switch (orientation) {
          case "bottom":
            {
              const nextElementSibling = g.node()?.nextElementSibling;
              if (nextElementSibling?.matches(`.${HORIZONTAL_AXIS_CLASS}.${orientation}`)) {
                setTimeout(() => {
                  if (!nextElementSibling.innerHTML) {
                    return;
                  }
                  g.attr(
                    "transform",
                    `translate(${marginLeft ?? 0},${nextElementSibling.getBoundingClientRect().top - svg.getBoundingClientRect().top - thisHeight})`,
                  );
                }, 0);
              } else {
                g.attr("transform", `translate(${marginLeft ?? 0},${height - thisHeight})`);
              }
              setChartState({ marginBottom: totalHeight });
            }
            break;
          case "top":
            {
              const previousElementSibling = g.node()?.previousElementSibling;
              if (previousElementSibling?.matches(`.${HORIZONTAL_AXIS_CLASS}.${orientation}`) && previousElementSibling.innerHTML) {
                g.attr("transform", `translate(${marginLeft ?? 0},${previousElementSibling.getBoundingClientRect().height + thisHeight})`);
              } else {
                g.attr("transform", `translate(${marginLeft ?? 0},${thisHeight})`);
              }
              setChartState({ marginTop: totalHeight });
            }
            break;
        }
        if (marginLeft) {
          const ticks = g.node()?.querySelectorAll(".tick");
          if (!ticks) {
            return;
          }
          for (const item of ticks) {
            const transform = item.getAttribute("transform");
            if (!transform) {
              return;
            }
            const transformX = Number(transform.slice(10, transform.length - 3));
            if (transformX < -marginLeft || transformX >= width) {
              item.remove();
            }
          }
        }
      });
  }, [gridLines, height, marginLeft, orientation, scale, setChartState, tickPadding, tickSize, tickValues, width]);

  useEffect(() => {
    if (!dataRange) {
      return;
    }
    setAxes({ [axisId]: { dataRange: dataRange } });
  }, [axisId, dataRange, setAxes]);

  useEffect(() => {
    if (!data?.length || !width) {
      return;
    }
    let scale = scaleBand<AxisDomain>().paddingInner(0.1).paddingOuter(0);
    if (dataKey) {
      scale = scale.domain(
        data.map((item) => {
          return item[dataKey];
        }),
      );
    }
    scale = scale.range([0, width - (marginLeft ?? 0) - (marginRight ?? 0)]);
    setAxes({ [axisId]: { dimension: "x", scale: scale } });
  }, [axisId, data, dataKey, marginLeft, marginRight, setAxes, width]);

  if (!data?.length || !width || !height) {
    return null;
  }

  return (
    <>
      {gridLines && <g ref={gridLinesRef} className="x-axis-grid-lines" clipPath={`url(#${clipPathId})`} data-axis-id={axisId} />}
      <g
        ref={(instance) => {
          thisRef.current = instance;
          if (ref) {
            if (typeof ref === "function") {
              ref(instance);
            } else {
              ref.current = instance;
            }
          }
        }}
        className={HORIZONTAL_AXIS_CLASS + " " + orientation}
        data-axis-id={axisId}
        {...props}
      />
    </>
  );
});

export default HorizontalAxis;
