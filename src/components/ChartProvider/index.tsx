"use client";

import { ReactNode, createContext, useEffect, useId, useRef } from "react";
import { StoreApi, createStore } from "zustand";
import { CartesianChartStore, PieChartStore, RadarChartStore } from "../../types";

export const ChartContext = createContext<StoreApi<CartesianChartStore & PieChartStore & RadarChartStore> | null>(null);

const ChartProvider = ({
  children,
  ...props
}: { children: ReactNode; type: "cartesian" | "pie" | "radar" } & Pick<Partial<CartesianChartStore & PieChartStore & RadarChartStore>, "data" | "padding">) => {
  const storeRef = useRef<StoreApi<CartesianChartStore | PieChartStore | RadarChartStore> | null>(null);
  const uniqueId = useId();

  if (!storeRef.current) {
    storeRef.current = createStore((set) => {
      return {
        type: props.type,
        chartId: `chart${uniqueId.slice(1, uniqueId.length - 1)}`,
        axes: {},
        setAxes(axes) {
          set((state) => {
            const axes1 = state.axes;
            for (const key in axes) {
              if (axes1[key]) {
                axes1[key] = { ...axes1[key], ...axes[key] };
              } else {
                axes1[key] = axes[key];
              }
            }
            return { ...state, axes: axes1 };
          });
        },
      };
    });
  }

  useEffect(() => {
    storeRef.current?.setState({ data: props.data, padding: props.padding });
  }, [props.data, props.padding]);

  return <ChartContext.Provider value={storeRef.current}>{children}</ChartContext.Provider>;
};

export default ChartProvider;
