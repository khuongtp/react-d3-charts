import { useContext } from "react";
import { ChartContext } from "../components/ChartProvider";

export const useSetChartState = () => {
  const store = useContext(ChartContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return store.setState;
};
