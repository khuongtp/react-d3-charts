"use client";

import { Children, ReactElement, SVGAttributes, cloneElement, useContext, useMemo } from "react";
import { useChartStore } from "../../hooks/useChartStore";
import { BarProps } from "../../types";
import { GroupContext } from "../CartesianChartGroup";

type StackProps = SVGAttributes<SVGGElement> & {
  index: number;
  dataIndex: number;
  yAxisid: string;
};

const CartesianChartStack = ({ index, dataIndex, children, yAxisid, ...props }: StackProps) => {
  const { xScale: groupXScale } = useContext(GroupContext);
  const data = useChartStore((state) => {
    return state.data;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const yScale = useChartStore((state) => {
    return state.axes[yAxisid]?.scale;
  });

  const pivotY = useMemo(() => {
    return yScale?.(0) ?? 0;
  }, [yScale]);

  if (!data?.length || !height || marginBottom === undefined || !groupXScale || !yScale) {
    return null;
  }

  let positiveOccupiedHeight = 0;
  let negativeOccupiedHeight = 0;

  return (
    <g className="stack" transform={`translate(${groupXScale(index) ?? 0},0)`} {...props}>
      {Children.map(children, (item, index) => {
        const barItem = item as ReactElement<BarProps>;
        const dataField = data[dataIndex]?.[barItem.props.dataKey] as number;
        let barY;
        let barHeight;
        if (dataField > 0) {
          barY = (yScale(dataField) ?? 0) - positiveOccupiedHeight;
          barHeight = pivotY - (yScale(dataField) ?? 0);
          positiveOccupiedHeight += barHeight;
        } else {
          barY = pivotY + negativeOccupiedHeight;
          barHeight = (yScale(dataField) ?? 0) - pivotY;
          negativeOccupiedHeight += barHeight;
        }
        return cloneElement(barItem, {
          key: index,
          y: barY,
          width: groupXScale.bandwidth?.(),
          height: Math.max(0, barHeight),
        });
      })}
    </g>
  );
};

export default CartesianChartStack;
