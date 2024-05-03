"use client";

import { cloneElement } from "react";
import { DEFAULT_X_AXIS_ID, DEFAULT_Y_AXIS_ID } from "../../constants";
import { BarProps } from "../../types";

const Bar = ({ render, dataKey, stackId, xAxisId = DEFAULT_X_AXIS_ID, yAxisId = DEFAULT_Y_AXIS_ID, ...props }: BarProps) => {
  if (render) {
    if (typeof render === "function") {
      return render({
        ...props,
      });
    } else {
      return cloneElement(render, props);
    }
  }

  return <rect {...props} />;
};

export default Bar;
