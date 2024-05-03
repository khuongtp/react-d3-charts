"use client";

import clamp from "lodash.clamp";
import throttle from "lodash.throttle";
import { HTMLAttributes, MouseEvent, useContext, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { TOOLTIP_CURSOR_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { TooltipProps } from "../../types";
import { ChartContext } from "../ChartProvider";

const MOUSE_MOVE_DELAY = 100;

const CartesianChartTooltip = ({ mode: trigger = "hover", render }: TooltipProps) => {
  const rectRef = useRef<SVGRectElement | null>(null);
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
  const store = useContext(ChartContext);
  const setChartState = useSetChartState();

  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if (!rectRef.current) {
        return;
      }
      if (
        event.clientX < rectRef.current.getBoundingClientRect().left ||
        event.clientX > rectRef.current.getBoundingClientRect().right ||
        event.clientY < rectRef.current.getBoundingClientRect().top ||
        event.clientY > rectRef.current.getBoundingClientRect().bottom
      ) {
        setChartState({ activeIndex: undefined, isTooltipLocked: false });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [setChartState, store, trigger]);

  if (!width || !height || marginLeft === undefined || marginRight === undefined) {
    return null;
  }

  const getSelectedIndex = (event: MouseEvent) => {
    if (!rectRef.current) {
      return;
    }
    const mouseX = event.clientX - rectRef.current.getBoundingClientRect().left;
    const xScale = store?.getState().axes["xAxis0"]?.scale;
    const range = xScale?.range();
    const domain = xScale?.domain();
    if (!range || !domain) {
      return;
    }
    const groupWidth = (range[1] - range[0]) / domain.length;
    let selectedIndex = 0;
    let lastRight = range[0] + groupWidth;
    while (lastRight < mouseX) {
      selectedIndex++;
      lastRight += groupWidth;
    }
    return selectedIndex;
  };

  const setTooltipCursor = (event: MouseEvent) => {
    if (!rectRef.current) {
      return;
    }
    // setChartState({
    //   key: "tooltipCursorX",
    //   value: event.clientX - thisRef.current.getBoundingClientRect().left,
    // });
    setChartState({ tooltipCursorY: event.clientY - rectRef.current.getBoundingClientRect().top });
  };

  const setSelectedIndex = (event: MouseEvent, isInWrapper?: boolean) => {
    if (isInWrapper) {
      return;
    }
    setTooltipCursor(event);
    const selectedIndex = getSelectedIndex(event);
    setChartState({ activeIndex: selectedIndex });
  };

  const throttledSetSelectedIndex = throttle((event: MouseEvent, isInWrapper?: boolean) => {
    setSelectedIndex(event, isInWrapper);
  }, MOUSE_MOVE_DELAY);

  return (
    <>
      <TooltipCursor />
      {/* Need this rect because it seems mouse events not working with foreignObject on ios */}
      <rect
        ref={rectRef}
        width={width - marginLeft - marginRight}
        height={height}
        fill="transparent"
        onMouseMove={
          trigger === "hover"
            ? (event) => {
                if (store?.getState().isTooltipLocked) {
                  return;
                }
                throttledSetSelectedIndex(event);
              }
            : undefined
        }
        onMouseLeave={
          trigger === "hover"
            ? () => {
                setTimeout(() => {
                  if (store?.getState().isTooltipHovered || store?.getState().isTooltipLocked) {
                    return;
                  }
                  setTimeout(() => {
                    setChartState({ activeIndex: undefined });
                  }, MOUSE_MOVE_DELAY);
                }, 0);
              }
            : undefined
        }
        onClick={(event) => {
          const selectedIndex = getSelectedIndex(event);
          switch (trigger) {
            case "hover":
              if (selectedIndex === store?.getState().activeIndex) {
                setChartState({ isTooltipLocked: !store?.getState().isTooltipLocked });
              } else {
                setChartState({ activeIndex: selectedIndex, isTooltipLocked: false });
              }
              break;
            case "click":
              if (selectedIndex === store?.getState().activeIndex) {
                setChartState({ activeIndex: undefined });
              } else {
                setSelectedIndex(event);
              }
              break;
          }
        }}
      />
      <foreignObject width={width - marginLeft - marginRight} height={height} style={{ pointerEvents: "none" }}>
        <TooltipWrapper
          onMouseEnter={() => {
            setChartState({ isTooltipHovered: true });
          }}
          onMouseLeave={() => {
            setChartState({ isTooltipHovered: false });
          }}
        >
          {typeof render === "function" ? render() : render}
        </TooltipWrapper>
      </foreignObject>
    </>
  );
};

const TooltipCursor = () => {
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const data = useChartStore((state) => {
    return state.data;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const xScale = useChartStore((state) => {
    return state.axes["xAxis0"]?.scale;
  });
  const selectedIndex = useChartStore((state) => {
    return state.activeIndex;
  });
  const range = xScale?.range();
  const domain = xScale?.domain();
  const minRange = range?.[0] ?? 0;
  const maxRange = range?.[1] ?? 0;
  const groupWidth = useMemo(() => {
    return (maxRange - minRange) / (domain?.length ?? 1);
  }, [domain?.length, maxRange, minRange]);

  if (!data?.length || !height || marginBottom === undefined || !xScale || selectedIndex === undefined || !chartId) {
    return null;
  }

  const centerGroupX = (xScale(data[selectedIndex]["x"]) ?? 0) + (xScale.bandwidth?.() ?? 0) / 2;

  return createPortal(
    <rect x={centerGroupX - groupWidth / 2} width={groupWidth} height={height - marginBottom} fill="lightgray" opacity={0.5} />,
    document.getElementById(chartId)!.getElementsByClassName(TOOLTIP_CURSOR_CLASS)[0],
  );
};

const TooltipWrapper = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const thisRef = useRef<HTMLDivElement | null>(null);
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
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const selectedIndex = useChartStore((state) => {
    return state.activeIndex;
  });
  const xScale = useChartStore((state) => {
    return state.axes["xAxis0"]?.scale;
  });
  const tooltipCursorY = useChartStore((state) => {
    return state.tooltipCursorY;
  });

  if (
    !data?.length ||
    !width ||
    !height ||
    marginLeft === undefined ||
    marginRight === undefined ||
    marginBottom === undefined ||
    !xScale ||
    selectedIndex === undefined ||
    tooltipCursorY === undefined
  ) {
    return null;
  }
  const centerGroupX = (xScale(data[selectedIndex]["x"]) ?? 0) + (xScale.bandwidth?.() ?? 0) / 2;

  return (
    <div
      ref={(instance) => {
        thisRef.current = instance;
        if (instance) {
          instance.style.transform = `translateX(${centerGroupX + instance.getBoundingClientRect().width > width - marginLeft - marginRight ? centerGroupX - instance.getBoundingClientRect().width : centerGroupX}px) translateY(${clamp(tooltipCursorY, 0, height - marginBottom - instance.getBoundingClientRect().height)}px)`;
          setTimeout(() => {
            instance.style.transition = "transform 200ms ease-out";
          }, 0);
        }
      }}
      style={{
        display: "inline-block",
        willChange: "transform",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default CartesianChartTooltip;
