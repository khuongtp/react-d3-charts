"use client";

import { createPortal } from "react-dom";
import { PLOT_CLASS, RADIAL_AXIS_LABELS_CLASS, TOOLTIP_CLASS, TOOLTIP_CURSOR_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { TooltipProps } from "../../types";
import { useContext, useEffect } from "react";
import throttle from "lodash.throttle";
import { useSetChartState } from "../../hooks/useSetChartState";
import { ChartContext } from "../ChartProvider";

const RadarChartTooltip = ({ render, mode = "hover" }: TooltipProps) => {
  const store = useContext(ChartContext);
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const tooltipCursorX = useChartStore((state) => {
    return state.tooltipCursorX;
  });
  const tooltipCursorY = useChartStore((state) => {
    return state.tooltipCursorY;
  });
  const setChartState = useSetChartState();

  useEffect(() => {
    const onClick = () => {
      if (store?.getState().isCursorInside) {
        return;
      }
      setChartState({ activeIndex: undefined, tooltipCursorX: undefined, tooltipCursorY: undefined, isTooltipLocked: false });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [setChartState, store]);

  const getActiveIndex = (event: MouseEvent) => {
    const data = store?.getState().data;
    if (!data?.length) {
      return;
    }
    const theta = (2 * Math.PI) / data.length;
    const svgRect = document.querySelector(`#${chartId} svg`)!.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    let angle;
    if (y > 0) {
      if (x > 0) {
        angle = 0.5 * Math.PI + Math.atan(absY / absX);
      } else {
        angle = Math.PI + Math.atan(absX / absY);
      }
    } else {
      if (x > 0) {
        angle = Math.atan(absX / absY);
      } else {
        angle = 1.5 * Math.PI + Math.atan(absY / absX);
      }
    }
    const negativeAngle = -(2 * Math.PI - angle);
    let vertexAngle = 0;
    for (let i = 0; i < data.length; i++) {
      const angle1 = vertexAngle - theta / 2;
      const angle2 = vertexAngle + theta / 2;
      if ((angle >= angle1 && angle < angle2) || (negativeAngle >= angle1 && negativeAngle < angle2)) {
        return i;
      } else {
        vertexAngle += theta;
      }
    }
  };

  const throttled = throttle((event: MouseEvent) => {
    setChartState({ activeIndex: getActiveIndex(event), tooltipCursorX: event.clientX, tooltipCursorY: event.clientY });
  }, 100);

  useEffect(() => {
    const onMouseEnter = () => {
      setChartState({ isCursorInside: true });
    };
    const onMouseMove = (event: MouseEvent) => {
      if (store?.getState().isTooltipLocked) {
        return;
      }
      throttled(event);
    };
    const onMouseLeave = () => {
      setChartState({ isCursorInside: false });
      setTimeout(() => {
        if (store?.getState().isTooltipHovered || store?.getState().isTooltipLocked) {
          return;
        }
        setTimeout(() => {
          setChartState({ activeIndex: undefined, tooltipCursorX: undefined, tooltipCursorY: undefined });
        }, 100);
      }, 0);
    };
    const onClick = (event: MouseEvent) => {
      const activeIndex = getActiveIndex(event);
      switch (mode) {
        case "hover":
          if (activeIndex === store?.getState().activeIndex) {
            setChartState({ isTooltipLocked: !store?.getState().isTooltipLocked });
          } else {
            setChartState({ activeIndex: activeIndex, tooltipCursorX: event.clientX, tooltipCursorY: event.clientY, isTooltipLocked: false });
          }
          break;
        case "click":
          if (activeIndex === store?.getState().activeIndex) {
            setChartState({ activeIndex: undefined, tooltipCursorX: undefined, tooltipCursorY: undefined });
          } else {
            setChartState({ activeIndex: activeIndex, tooltipCursorX: event.clientX, tooltipCursorY: event.clientY });
          }
          break;
      }
    };
    const plot = document.querySelector<SVGGElement>(`#${chartId} .${PLOT_CLASS}`);
    const labels = document.querySelector<HTMLDivElement>(`#${chartId} .${RADIAL_AXIS_LABELS_CLASS}`);
    if (mode === "hover") {
      plot?.addEventListener("mousemove", onMouseMove);
      plot?.addEventListener("mouseleave", onMouseLeave);
      labels?.addEventListener("mousemove", onMouseMove);
      labels?.addEventListener("mouseleave", onMouseLeave);
    }
    plot?.addEventListener("mouseenter", onMouseEnter);
    labels?.addEventListener("mouseenter", onMouseEnter);
    plot?.addEventListener("click", onClick);
    labels?.addEventListener("click", onClick);
    return () => {
      plot?.removeEventListener("mousemove", onMouseMove);
      plot?.removeEventListener("mouseleave", onMouseLeave);
      labels?.removeEventListener("mousemove", onMouseMove);
      labels?.removeEventListener("mouseleave", onMouseLeave);
      plot?.removeEventListener("mouseenter", onMouseEnter);
      labels?.removeEventListener("mouseenter", onMouseEnter);
      plot?.removeEventListener("click", onClick);
      labels?.removeEventListener("click", onClick);
    };
  }, [chartId, mode, setChartState, store]);

  if (tooltipCursorX === undefined || tooltipCursorY === undefined) {
    return null;
  }

  return (
    <>
      {createPortal(
        <div
          ref={(instance) => {
            if (instance) {
              const svgRect = document.getElementById(chartId!)!.querySelector("svg")!.getBoundingClientRect();
              const overflowingWidth = Math.max(0, tooltipCursorX + instance.getBoundingClientRect().width - document.documentElement.clientWidth);
              const overflowingHeight = Math.max(0, tooltipCursorY + instance.getBoundingClientRect().height - document.documentElement.clientHeight);
              instance.style.left = tooltipCursorX - svgRect.left - overflowingWidth + "px";
              instance.style.top = tooltipCursorY - svgRect.top - overflowingHeight + "px";
              setTimeout(() => {
                instance.style.transition = "all 200ms ease-out";
              });
            }
          }}
          style={{
            position: "absolute",
            pointerEvents: "none",
            display: "inline-block",
          }}
        >
          {typeof render === "function" ? render() : render}
        </div>,
        document.querySelector(`#${chartId} .${TOOLTIP_CLASS}`)!,
      )}
      <RadarChartTooltipCursor />
    </>
  );
};

const RadarChartTooltipCursor = () => {
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const data = useChartStore((state) => {
    return state.data;
  });
  const activeIndex = useChartStore((state) => {
    return state.activeIndex;
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

  if (!data?.length || activeIndex === undefined || !width || !height) {
    return null;
  }

  const startAngle = -0.5 * Math.PI;
  const theta = (2 * Math.PI) / data.length;
  const radius = Math.min(width, height) / 2 - (padding ?? 0);

  return createPortal(
    <line
      className="radar-chart-tooltip-cursor"
      x1={0}
      y1={0}
      x2={Math.cos(startAngle + theta * activeIndex) * radius}
      y2={Math.sin(startAngle + theta * activeIndex) * radius}
      stroke="currentColor"
    />,
    document.querySelector(`#${chartId} .${TOOLTIP_CURSOR_CLASS}`)!,
  );
};

export default RadarChartTooltip;
