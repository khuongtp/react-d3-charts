"use client";

import debounce from "lodash.debounce";
import { Children, ReactElement, isValidElement, useEffect, useId, useRef } from "react";
import { DEFAULT_X_AXIS_ID } from "../../constants";
import { useSetChartState } from "../../hooks/useSetChartState";
import { AxisState, BarProps, CartesianChartProps, HorizontalAxisProps, LineProps, VerticalAxisProps } from "../../types";
import Bar from "../Bar";
import CartesianChartGroup from "../CartesianChartGroup";
import CartesianChartPlot from "../CartesianChartPlot";
import CartesianChartStack from "../CartesianChartStack";
import CartesianChartTooltip from "../CartesianChartTooltip";
import ChartProvider from "../ChartProvider";
import HorizontalAxis from "../HorizontalAxis";
import Line from "../Line";
import VerticalAxis from "../VerticalAxis";

const CartesianChart = (props: CartesianChartProps) => {
  return (
    <ChartProvider data={props.data} type="cartesian">
      <Chart {...props} />
    </ChartProvider>
  );
};

const Chart = ({ children, data, layout = "horizontal", scaleExtent = [0, Infinity], ...props }: CartesianChartProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const uniqueId = useId();
  const setChartState = useSetChartState();

  const bars: ReactElement<BarProps>[][] = [];
  const lines: ReactElement<LineProps>[] = [];
  const stackIndices: Map<string, number> = new Map();
  const leftYAxes: ReactElement<VerticalAxisProps>[] = [];
  const rightYAxes: ReactElement<VerticalAxisProps>[] = [];
  const topXAxes: ReactElement<HorizontalAxisProps>[] = [];
  const bottomXAxes: ReactElement<HorizontalAxisProps>[] = [];
  let tooltip: ReactElement | null = null;

  Children.forEach(children, (item) => {
    if (!isValidElement(item)) {
      return;
    }
    if (item.type === Bar) {
      const barItem = item as ReactElement<BarProps>;
      const stackId = barItem.props.stackId;
      if (stackId) {
        if (!stackIndices.has(stackId)) {
          stackIndices.set(stackId, bars.length);
        }
        const stack = bars[stackIndices.get(stackId)!];
        if (stack) {
          stack.push(barItem);
        } else {
          bars.push([barItem]);
        }
      } else {
        bars.push([barItem]);
      }
    }
    if (item.type === Line) {
      lines.push(item as ReactElement<LineProps>);
    }
    if (item.type === VerticalAxis) {
      const yAxisItem = item as ReactElement<VerticalAxisProps>;
      switch (yAxisItem.props.orientation) {
        case "right":
          rightYAxes.push(yAxisItem);
          break;
        case "left":
        default:
          leftYAxes.push(yAxisItem);
          break;
      }
    }
    if (item.type === HorizontalAxis) {
      const xAxisItem = item as ReactElement<HorizontalAxisProps>;
      switch (xAxisItem.props.orientation) {
        case "top":
          topXAxes.push(xAxisItem);
          break;
        case "bottom":
        default:
          bottomXAxes.push(xAxisItem);
          break;
      }
    }
    if (item.type === CartesianChartTooltip) {
      tooltip = item;
    }
  });

  const resizeObserverCallback = debounce(() => {
    setChartState({ width: divRef.current?.getBoundingClientRect().width ?? 0, height: divRef.current?.getBoundingClientRect().height ?? 0 });
  }, 100);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    const resizeObserver = new ResizeObserver(resizeObserverCallback);
    // ResizeObserver not working on svg
    resizeObserver.observe(divRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeObserverCallback]);

  useEffect(() => {
    const axes: Record<string, AxisState> = {};
    for (const dataObject of data) {
      for (const stack of bars) {
        let totalPositive = 0;
        let totalNegative = 0;
        for (const bar of stack) {
          const dataField = dataObject[bar.props.dataKey] as number;
          if (dataField >= 0) {
            totalPositive += dataField;
          } else {
            totalNegative += dataField;
          }
        }
        const axisId = stack[0].props.yAxisId ?? DEFAULT_X_AXIS_ID;
        let axisItem = axes[axisId];
        if (!axisItem) {
          axes[axisId] = {
            domain: [totalNegative, totalPositive],
          };
          axisItem = {
            domain: [totalNegative, totalPositive],
          };
        } else if (axisItem.domain) {
          axisItem.domain[0] = Math.min(totalNegative, axisItem.domain[0]);
          axisItem.domain[1] = Math.max(totalPositive, axisItem.domain[1]);
        }
      }
      for (const line of lines) {
        const axisId = line.props.yAxisId ?? DEFAULT_X_AXIS_ID;
        let axisItem = axes[axisId];
        const dataField = dataObject[line.props.dataKey] as number;
        if (!axisItem) {
          axes[axisId] = { domain: [Math.min(0, dataField), dataField] };
          axisItem = { domain: [Math.min(0, dataField), dataField] };
        } else if (axisItem.domain) {
          axisItem.domain[0] = Math.min(Math.min(0, dataField), axisItem.domain[0]);
          axisItem.domain[1] = Math.max(dataField, axisItem.domain[1]);
        }
      }
    }
    setChartState({ axes: axes });
  }, [bars, data, lines, setChartState]);

  useEffect(() => {
    setChartState({ chartId: `svg${uniqueId}` });
  }, [setChartState, uniqueId]);

  useEffect(() => {
    if (!leftYAxes.length) {
      setChartState({ marginLeft: 0 });
    }
    if (!rightYAxes.length) {
      setChartState({ marginRight: 0 });
    }
    if (!bottomXAxes.length) {
      setChartState({ marginBottom: 0 });
    }
    if (!topXAxes.length) {
      setChartState({ marginTop: 0 });
    }
  }, [bottomXAxes.length, leftYAxes.length, rightYAxes.length, setChartState, topXAxes.length]);

  useEffect(() => {
    setChartState({ clipPathId: `clipPath${uniqueId}`, fullHeightClipPathId: `fullHeightClipPath${uniqueId}` });
  }, [setChartState, uniqueId]);

  return (
    <div ref={divRef} id={`chart${uniqueId}`} style={{ width: props.width, height: props.height }}>
      <svg id={`svg${uniqueId}`} style={{ display: "block" }} {...props}>
        {[...topXAxes]}
        {[...bottomXAxes.reverse()]}
        {[...leftYAxes]}
        {[...rightYAxes.reverse()]}
        <CartesianChartPlot scaleExtent={scaleExtent}>
          {data.map((_, dataIndex) => {
            return (
              <CartesianChartGroup key={dataIndex} dataIndex={dataIndex}>
                {bars.map((stack, j) => {
                  return (
                    <CartesianChartStack key={j} dataIndex={dataIndex} index={j} yAxisid={stack[0].props.yAxisId!}>
                      {[...stack]}
                    </CartesianChartStack>
                  );
                })}
              </CartesianChartGroup>
            );
          })}
          {[...lines]}
          {tooltip}
        </CartesianChartPlot>
      </svg>
    </div>
  );
};

export default CartesianChart;
