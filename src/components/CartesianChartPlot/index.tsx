"use client";

import { ScaleBand } from "d3-scale";
import { select } from "d3-selection";
import { D3ZoomEvent, zoom, zoomIdentity } from "d3-zoom";
import { HTMLAttributes, SVGAttributes, useContext, useEffect, useRef, useState } from "react";
import { TOOLTIP_CURSOR_CLASS } from "../../constants";
import { useChartStore } from "../../hooks/useChartStore";
import { useSetChartState } from "../../hooks/useSetChartState";
import { CartesianChartProps } from "../../types";
import { ChartContext } from "../ChartProvider";

const CartesianChartPlot = ({ children, scaleExtent, ...props }: Pick<CartesianChartProps, "scaleExtent"> & HTMLAttributes<SVGGElement>) => {
  const gRef = useRef<SVGGElement | null>(null);
  const [height, setHeight] = useState<number>(); // Trick to avoid same state values trigger two re-renders
  const store = useContext(ChartContext);
  const width = useChartStore((state) => {
    return state.width;
  });
  const height1 = useChartStore((state) => {
    return state.height;
  });
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const marginTop = useChartStore((state) => {
    return state.marginTop;
  });
  const marginLeft = useChartStore((state) => {
    return state.marginLeft;
  });
  const marginRight = useChartStore((state) => {
    return state.marginRight;
  });
  const clipPathId = useChartStore((state) => {
    return state.clipPathId;
  });
  const fullHeightClipPathId = useChartStore((state) => {
    return state.fullHeightClipPathId;
  });
  const setChartState = useSetChartState();
  const setAxes = useChartStore((state) => {
    return state.setAxes;
  });

  useEffect(() => {
    setHeight(height1);
  }, [height1]);

  useEffect(() => {
    if (!gRef.current) {
      return;
    }
    select(gRef.current).call(zoom<SVGGElement, any>().transform, zoomIdentity);
  }, []);

  useEffect(() => {
    if (
      !gRef.current ||
      !width ||
      !height ||
      marginTop === undefined ||
      marginRight === undefined ||
      marginBottom === undefined ||
      marginLeft === undefined ||
      (scaleExtent && scaleExtent[0] === scaleExtent[1])
    ) {
      return;
    }
    select(gRef.current).call(
      zoom<SVGGElement, any>()
        .scaleExtent([1, Infinity])
        .translateExtent([
          [0, 0],
          [width - marginLeft - marginRight, height - marginBottom],
        ])
        .extent([
          [0, 0],
          [width - marginLeft - marginRight, height - marginBottom],
        ])
        .on("zoom", (event: D3ZoomEvent<SVGGElement, any>) => {
          const currentTransformX = store?.getState().transform?.x;
          const currentTransformK = store?.getState().transform?.k;
          if (currentTransformX === Math.round(event.transform.x) && currentTransformK === event.transform.k) {
            return;
          }
          setChartState({ transform: { ...event.transform, x: Math.round(event.transform.x) } });
          if (store) {
            for (const [key, value] of Object.entries(store.getState().axes)) {
              if (value.dimension === "x") {
                if (!value.scale) {
                  continue;
                }
                const newScale = (value.scale as ScaleBand<any>).range(
                  [0, width - marginLeft - marginRight].map((item) => {
                    return event.transform.applyX(item);
                  }),
                );
                setAxes({ [key]: { scale: newScale.copy() } });
              }
            }
          }
        }),
    );
  }, [height, marginBottom, marginLeft, marginRight, marginTop, scaleExtent, setAxes, setChartState, store, width]);

  if (!width || !height || marginTop === undefined || marginRight === undefined || marginBottom === undefined || marginLeft === undefined) {
    return null;
  }

  return (
    <>
      <defs>
        <clipPath id={fullHeightClipPathId}>
          <PlotArea height={height} />
        </clipPath>
        <clipPath id={clipPathId}>
          <PlotArea />
        </clipPath>
      </defs>
      <g className="plot" ref={gRef} transform={`translate(${marginLeft},${0})`} clipPath={`url(#${fullHeightClipPathId})`} {...props}>
        <g className={TOOLTIP_CURSOR_CLASS} />
        <PlotArea />
        {children}
      </g>
    </>
  );
};

// Need to have this in order to be able to zoom
const PlotArea = (props: SVGAttributes<SVGRectElement>) => {
  const width = useChartStore((state) => {
    return state.width;
  });
  const height = useChartStore((state) => {
    return state.height;
  });
  const marginBottom = useChartStore((state) => {
    return state.marginBottom;
  });
  const marginTop = useChartStore((state) => {
    return state.marginTop;
  });
  const marginLeft = useChartStore((state) => {
    return state.marginLeft;
  });
  const marginRight = useChartStore((state) => {
    return state.marginRight;
  });
  if (!width || !height || marginTop === undefined || marginRight === undefined || marginBottom === undefined || marginLeft === undefined) {
    return null;
  }
  return <rect width={width - marginLeft - marginRight} height={height - marginBottom - marginTop} fill="transparent" y={marginTop} {...props} />;
};

export default CartesianChartPlot;
