"use client";

import debounce from "lodash.debounce";
import { SVGAttributes, useEffect, useRef } from "react";
import { RADIAL_AXIS_LABELS_CLASS, TOOLTIP_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import ChartComponents from "../ChartComponents";
import ChartProvider from "../ChartProvider";
import RadarChartPlot from "../RadarChartPlot";

type RadarChartProps = { data: Record<string, any>[]; padding?: number } & SVGAttributes<SVGSVGElement>;

const RadarChart = (props: RadarChartProps) => {
  return (
    <ChartProvider data={props.data} padding={props.padding} type="radar">
      <Chart {...props} />
    </ChartProvider>
  );
};

const Chart = ({ data, children, padding, ...props }: RadarChartProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const chartId = useChartStore((state) => {
    return state.chartId;
  });
  const setChartState = useSetChartState();

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

  return (
    <>
      <div id={chartId} ref={divRef} style={{ position: "relative", width: props.width, height: props.height }}>
        <svg style={{ position: "relative", display: "block" }} {...props}>
          <RadarChartPlot />
        </svg>
        <div className={RADIAL_AXIS_LABELS_CLASS} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div className={TOOLTIP_CLASS} />
      </div>
      <ChartComponents>{children}</ChartComponents>
    </>
  );
};

export default RadarChart;
