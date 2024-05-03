"use client";

import { pie } from "d3-shape";
import debounce from "lodash.debounce";
import { useEffect, useRef } from "react";
import { TOOLTIP_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { PieChartProps } from "../../types";
import ChartComponents from "../ChartComponents";
import ChartProvider from "../ChartProvider";
import PieChartPlot from "../PieChartPlot";

const PieChart = (props: PieChartProps) => {
  return (
    <ChartProvider data={props.data} type="pie">
      <Chart {...props} />
    </ChartProvider>
  );
};

const Chart = ({ data, children, dataKey, ...props }: PieChartProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const setChartState = useSetChartState();
  const chartId = useChartStore((state) => {
    return state.chartId;
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
    if (!data?.length) {
      return;
    }
    setChartState({
      pie: pie<Record<string, any>>()
        .sort(null)
        .value((dataObject) => {
          return dataObject[dataKey];
        })(data),
    });
  }, [data, dataKey, setChartState]);

  return (
    <>
      <div ref={divRef} id={chartId} style={{ position: "relative", width: props.width, height: props.height }}>
        <svg style={{ display: "block", position: "relative" }} {...props}>
          <PieChartPlot dataKey={dataKey} />
        </svg>
        <div className={TOOLTIP_CLASS} />
      </div>
      <ChartComponents>{children}</ChartComponents>
    </>
  );
};

export default PieChart;
