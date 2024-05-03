import { useContext } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { ChartContext } from "../components/ChartProvider";
import { CartesianChartStore, PieChartStore, RadarChartStore } from "../types";

export const useChartStore = ((selector) => {
  const store = useContext(ChartContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return useStore(store, selector);
}) as UseBoundStore<StoreApi<CartesianChartStore & PieChartStore & RadarChartStore>>;
