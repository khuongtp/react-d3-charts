"use client";

import throttle from "lodash.throttle";
import { useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { MOUSE_MOVE_DELAY, PLOT_CLASS, TOOLTIP_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { TooltipProps } from "../../types";
import { ChartContext } from "../ChartProvider";

const PieChartTooltip = ({ mode = "hover", render }: TooltipProps) => {
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

  const throttled = throttle((event: globalThis.MouseEvent) => {
    setChartState({
      activeIndex: Number((event.target as Element).getAttribute("data-index")),
      tooltipCursorX: event.clientX,
      tooltipCursorY: event.clientY,
    });
  }, MOUSE_MOVE_DELAY);

  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if ((event.target as Element).getAttribute("data-index") === null) {
        setChartState({ activeIndex: undefined, tooltipCursorX: undefined, tooltipCursorY: undefined, isTooltipLocked: false });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [setChartState]);

  useEffect(() => {
    const plot = document.querySelector<SVGGElement>(`#${chartId} .${PLOT_CLASS}`)!;
    const onMouseMove = (event: globalThis.MouseEvent) => {
      if (store?.getState().isTooltipLocked) {
        return;
      }
      throttled(event);
    };
    const onMouseLeave = () => {
      setTimeout(() => {
        if (store?.getState().isTooltipHovered || store?.getState().isTooltipLocked) {
          return;
        }
        setTimeout(() => {
          setChartState({ activeIndex: undefined, tooltipCursorX: undefined, tooltipCursorY: undefined });
        }, MOUSE_MOVE_DELAY);
      }, 0);
    };
    const onClick = (event: globalThis.MouseEvent) => {
      const activeIndex = Number((event.target as Element).getAttribute("data-index"));
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
    if (mode === "hover") {
      plot?.addEventListener("mousemove", onMouseMove);
      plot?.addEventListener("mouseleave", onMouseLeave);
    }
    plot?.addEventListener("click", onClick);
    return () => {
      plot?.removeEventListener("mousemove", onMouseMove);
      plot?.removeEventListener("mouseleave", onMouseLeave);
      plot?.removeEventListener("click", onClick);
    };
  }, [chartId, mode, setChartState, store]);

  if (tooltipCursorX === undefined || tooltipCursorY === undefined) {
    return null;
  }

  return createPortal(
    <div
      ref={(instance) => {
        if (instance) {
          const chartRect = document.getElementById(chartId!)!.getBoundingClientRect()!;
          const left = tooltipCursorX - chartRect.left;
          const top = tooltipCursorY - chartRect.top;
          const overflowingWidth = Math.max(0, tooltipCursorX + instance.getBoundingClientRect().width - document.documentElement.clientWidth);
          const overflowingHeight = Math.max(0, tooltipCursorY + instance.getBoundingClientRect().height - document.documentElement.clientHeight);
          instance.style.left = (overflowingWidth ? left - overflowingWidth : left) + "px";
          instance.style.top = (overflowingHeight ? top - overflowingHeight : top) + "px";
          setTimeout(() => {
            instance.style.transition = "all 200ms ease-out";
          }, 0);
        }
      }}
      style={{
        position: "absolute",
        pointerEvents: "none",
        display: "inline-block",
      }}
      // onMouseEnter={() => {
      //   setChartState({ isTooltipHovered: true });
      // }}
      // onMouseLeave={() => {
      //   setChartState({ isTooltipHovered: false });
      // }}
    >
      {typeof render === "function" ? render() : render}
    </div>,
    document.querySelector(`#${chartId} .${TOOLTIP_CLASS}`)!,
  );
};

export default PieChartTooltip;
