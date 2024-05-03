import { ReactNode, memo } from "react";
import { useChartStore } from "../../hooks/useChartStore";

const ChartComponents = memo(function ChartComponents({ children }: { children: ReactNode }) {
  const isReady = useChartStore((state) => {
    return state.isReady;
  });

  if (!isReady) {
    return null;
  }

  return children;
});

export default ChartComponents;
