"use client";

import { range } from "d3-array";
import { axisLeft, axisRight } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import { DEFAULT_X_AXIS_ID, VERTICAL_AXIS_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { VerticalAxisProps } from "../../types";
import { ChartContext } from "../ChartProvider";

const VerticalAxis = forwardRef<SVGGElement, VerticalAxisProps>(function YAxis(
  {
    tickSize = 6,
    orientation = "left",
    axisId = DEFAULT_X_AXIS_ID,
    hidden,
    tickCount,
    gridLines,
    dataKey,
    tickPadding = 3,
    startDomainModifier,
    endDomainModifier,
    tickFormatter,
    ...props
  },
  ref,
) {
  const thisRef = useRef<SVGGElement | null>(null);
  const gridLinesRef = useRef<SVGGElement | null>(null);
  const store = useContext(ChartContext);
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const marginTop = useChartStore((state) => {
    return state.marginTop;
  });
  const domain = useChartStore((state) => {
    return state.axes[axisId]?.domain;
  });
  const clipPathId = useChartStore((state) => {
    return state.clipPathId;
  });
  const scale = useChartStore((state) => {
    return state.axes[axisId]?.scale;
  });
  const setAxes = useChartStore((state) => {
    return state.setAxes;
  });
  const setChartState = useSetChartState();

  const modifiedDomain = useMemo(() => {
    if (!domain) {
      return;
    }
    return [startDomainModifier ? startDomainModifier(domain[0]) : domain[0], endDomainModifier ? endDomainModifier(domain[1]) : domain[1]];
  }, [domain, endDomainModifier, startDomainModifier]);
  const tickValues = useMemo(() => {
    if (!modifiedDomain) {
      return;
    }
    let tickValues;
    if (tickCount) {
      const tickStep = (modifiedDomain[1] - modifiedDomain[0]) / tickCount;
      tickValues = range(modifiedDomain[0], modifiedDomain[1], tickStep);
    }
    return tickValues;
  }, [modifiedDomain, tickCount]);

  useEffect(() => {
    if (!gridLines || !gridLinesRef.current || !scale || !width) {
      return;
    }
    let axis = axisRight(scale).tickPadding(tickPadding);
    if (tickValues) {
      axis = axis.tickValues(tickValues);
    }
    select(gridLinesRef.current)
      .call(
        axis
          .tickSizeOuter(0)
          .tickSizeInner(width)
          .tickFormat(() => {
            return "";
          }),
      )
      .call((g) => {
        g.attr("transform", `translate(${store?.getState().marginLeft ?? 0},0)`);
        g.select(".domain").remove();
        g.selectAll(".tick text").remove();
      });
  }, [gridLines, scale, store, tickPadding, tickValues, width]);

  useEffect(() => {
    if (!width || !scale || !thisRef.current || hidden || !modifiedDomain) {
      return;
    }
    let axis;
    switch (orientation) {
      case "left":
        axis = axisLeft(scale);
        break;
      case "right":
        axis = axisRight(scale);
        break;
    }
    if (tickFormatter) {
      axis = axis.tickFormat(tickFormatter);
    }
    axis = axis.tickSizeInner(tickSize).tickSizeOuter(0);
    if (tickValues) {
      axis = axis.tickValues(tickValues);
    }
    select(thisRef.current)
      .call(axis)
      .call((g) => {
        const svg = g.node()?.ownerSVGElement;
        let totalWidth = 0;
        for (const item of svg!.querySelectorAll(`.${VERTICAL_AXIS_CLASS}.${orientation}`)) {
          totalWidth += item.getBoundingClientRect().width;
        }
        if (marginTop !== undefined) {
          const topMostTick = g.node()?.querySelector<SVGGElement>(".tick:last-child");
          if (topMostTick) {
            const overflowHeight = (svg?.getBoundingClientRect().top ?? 0) - (topMostTick?.getBoundingClientRect().top ?? 0);
            if (overflowHeight > 0) {
              topMostTick.querySelector("text")?.setAttribute("y", String(overflowHeight));
            }
          }
        }
        switch (orientation) {
          case "left":
            g.attr("transform", `translate(${g.node()?.getBoundingClientRect().width ?? 0}, ${marginTop ?? 0})`);
            setChartState({ marginLeft: totalWidth });
            break;
          case "right":
            g.attr("transform", `translate(${width - (g.node()?.getBoundingClientRect().width ?? 0)}, ${marginTop ?? 0})`);
            setChartState({ marginRight: totalWidth });
            break;
        }
      });
  }, [hidden, marginTop, modifiedDomain, orientation, scale, setChartState, tickFormatter, tickSize, tickValues, width]);

  useEffect(() => {
    if (!height || !modifiedDomain) {
      return;
    }
    let scale = scaleLinear();
    scale = scale.domain(modifiedDomain);
    scale = scale.range([height - (marginBottom ?? 0), marginTop ?? 0]);
    setAxes({ [axisId]: { scale: scale } });
  }, [axisId, modifiedDomain, height, marginBottom, marginTop, setAxes]);

  if (!width || !height) {
    return null;
  }

  return (
    <>
      {gridLines && <g ref={gridLinesRef} className="y-axis-grid-lines" clipPath={`url(#${clipPathId})`} data-axis-id={axisId} />}
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
        className={VERTICAL_AXIS_CLASS + " " + orientation}
        {...props}
      />
    </>
  );
});

export default VerticalAxis;
