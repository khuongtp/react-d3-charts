import { faker } from "@faker-js/faker";
import { CSSProperties, Dispatch, forwardRef, memo, useImperativeHandle, useMemo, useRef, useState, useTransition } from "react";
import "./App.css";
import Bar from "./components/Bar";
import CartesianChart from "./components/CartesianChart";
import HorizontalAxis from "./components/HorizontalAxis";
import PieChart from "./components/PieChart";
import PieChartTooltip from "./components/PieChartTooltip";
import RadarChart from "./components/RadarChart";
import RadarChartTooltip from "./components/RadarChartTooltip";
import RadialAxis from "./components/RadialAxis";
import Ring from "./components/Ring";
import Slice from "./components/Slice";

import { useChartStore } from "./hooks/useChartStore";
import { RadialAxisLabelProps } from "./types";
import Line from "./components/Line";
import VerticalAxis from "./components/VerticalAxis";

const data = Array(50)
  .fill(undefined)
  .map((_, index) => {
    return {
      value1: faker.number.int({ min: -100, max: 100 }),
      value2: faker.number.int({ min: -100, max: 100 }),
      value3: faker.number.int({ min: 0, max: 100 }),
      value4: faker.number.int({ min: 0, max: 100 }),
      x: String(1999 + index),
    };
  });

function App() {
  return (
    <>
      <TestCartesianChart />
      {/* <div>
        <div style={{ flex: 1 }}>
          <TestPieChart />
        </div>
        <div style={{ flex: 1, padding: "8px" }}>
          <TestRadarChart />
        </div>
      </div> */}
    </>
  );
}

const TestRadarChart = () => {
  const [data, setData] = useState([
    { subject: "Subject 1", value1: 0, value2: 2, value3: 1 },
    { subject: "Subject 2", value1: 2, value2: 1, value3: 2 },
    { subject: "Subject 3", value1: 1, value2: 3, value3: 1 },
    { subject: "Subject 4", value1: 4, value2: 3, value3: 3 },
    { subject: "Subject 5", value1: 2, value2: 4, value3: 2 },
    { subject: "Subject 6", value1: 2, value2: 5, value3: 4 },
    { subject: "Subject 6", value1: 2, value2: 5, value3: 4 },
    { subject: "Subject 6", value1: 2, value2: 5, value3: 4 },
  ]);
  return (
    <>
      <RadarChart padding={28} width="100%" height="300px" data={data}>
        <RadialAxis
          dataKey="subject"
          tickCount={6}
          axisLabel={useMemo(() => {
            return ({ label, angle }) => {
              const verticalPoleStyle: CSSProperties = {
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%)`,
                bottom: "unset",
              };
              const leftHalfStyle = {
                right: 0,
              };
              const lowerHalfStyle = {
                bottom: 0,
              };
              return (
                <div
                  style={{
                    padding: "4px",
                    position: "absolute",
                    whiteSpace: "nowrap",
                    ...(angle > 0.5 * Math.PI && angle < 1.5 * Math.PI && leftHalfStyle),
                    ...(angle > 0 && angle < Math.PI && lowerHalfStyle),
                    ...(Math.abs(angle) === 0.5 * Math.PI && verticalPoleStyle),
                  }}
                >
                  {label}
                </div>
              );
            };
          }, [])}
        />
        <Ring dataKey="value1" stroke="red" fill="rgba(255,0,0,0.1)" dots />
        <Ring dataKey="value2" stroke="green" fill="rgba(0,128,0,0.1)" dots />
        <Ring dataKey="value3" stroke="blue" fill="rgba(0,0,255,0.1)" dots />
        <RadarChartTooltip render={<RadarChartTooltip1 />} />
      </RadarChart>
      <button
        onClick={() => {
          setData([
            {
              subject: "Subject 1",
              value1: faker.number.int({ min: 0, max: 4 }),
              value2: faker.number.int({ min: 0, max: 4 }),
              value3: faker.number.int({ min: 0, max: 4 }),
            },
            {
              subject: "Subject 2",
              value1: faker.number.int({ min: 0, max: 4 }),
              value2: faker.number.int({ min: 0, max: 4 }),
              value3: faker.number.int({ min: 0, max: 4 }),
            },
            {
              subject: "Subject 3",
              value1: faker.number.int({ min: 0, max: 4 }),
              value2: faker.number.int({ min: 0, max: 4 }),
              value3: faker.number.int({ min: 0, max: 4 }),
            },
            {
              subject: "Subject 4",
              value1: faker.number.int({ min: 0, max: 4 }),
              value2: faker.number.int({ min: 0, max: 4 }),
              value3: faker.number.int({ min: 0, max: 4 }),
            },
            {
              subject: "Subject 5",
              value1: faker.number.int({ min: 0, max: 4 }),
              value2: faker.number.int({ min: 0, max: 4 }),
              value3: faker.number.int({ min: 0, max: 4 }),
            },
            // { subject: "Subject 6", value1: Math.random() * 10, value2: Math.random() * 10, value3: Math.random() * 10 },
          ]);
        }}
      >
        Change data
      </button>
    </>
  );
};

const TestRadarChartAxisLabel = memo(({ angle, label }: RadialAxisLabelProps) => {
  const verticalPoleStyle: CSSProperties = {
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    bottom: "unset",
  };
  const leftHalfStyle = {
    right: 0,
  };
  const lowerHalfStyle = {
    bottom: 0,
  };
  return (
    <div
      style={{
        padding: "4px",
        position: "absolute",
        whiteSpace: "nowrap",
        ...(angle > 0.5 * Math.PI && angle < 1.5 * Math.PI && leftHalfStyle),
        ...(angle > 0 && angle < Math.PI && lowerHalfStyle),
        ...(Math.abs(angle) === 0.5 * Math.PI && verticalPoleStyle),
      }}
    >
      {label}
    </div>
  );
});

const TestCartesianChart = () => {
  const [, startTransition] = useTransition();
  const [dataLength, setDataLength] = useState(2);
  // const [data, setData] = useState(
  //   Array(2)
  //     .fill(undefined)
  //     .map((_, index) => {
  //       return {
  //         value1: faker.number.int({ min: -100, max: 100 }),
  //         value2: faker.number.int({ min: -100, max: 100 }),
  //         value3: faker.number.int({ min: 0, max: 100 }),
  //         value4: faker.number.int({ min: 0, max: 100 }),
  //         x: String(1999 + index),
  //       };
  //     }),
  // );

  return (
    <div style={{ padding: "8px" }}>
      <CartesianChart
        width="100%"
        height="300px"
        data={data.slice(0, dataLength)}
        // data={data}
        scaleExtent={[1, Infinity]}
      >
        <HorizontalAxis dataKey="x" axisId="xAxis0" tickLabelWidth={40} gridLines />
        <VerticalAxis
          tickSize={8}
          tickCount={7}
          // tickFormatter={(domainValue) => {
          //   return Intl.NumberFormat(undefined, {
          //     notation: "compact",
          //   }).format(domainValue as number);
          // }}
          axisId="yAxisLeft"
          orientation="left"
          gridLines
        />
        <VerticalAxis
          orientation="right"
          axisId="yAxisRight"
          tickSize={8}
          tickCount={7}
          // endDomainModifier={(endDomain) => {
          //   return endDomain + 1.5;
          // }}
        />
        <Bar
          dataKey="value1"
          // render={(props) => {
          //   return <rect fill="red" {...props} />;
          // }}
          stackId="a"
          yAxisId="yAxisLeft"
        />
        <Bar dataKey="value2" fill="green" stackId="a" yAxisId="yAxisLeft" />
        <Bar dataKey="value3" fill="blue" yAxisId="yAxisLeft" />
        <Line dot curve="bumpX" dataKey="value4" stroke="black" strokeWidth={1} yAxisId="yAxisRight" xAxisId="xAxis0" />
        {/* <CartesianChartTooltip render={<TooltipContent />} /> */}
      </CartesianChart>
      {dataLength}
      <input
        defaultValue={Math.floor((10 / data.length) * 100)}
        type="range"
        onChange={(event) => {
          // startTransition(() => {
          setDataLength(Math.floor(data.length * (Number(event.target.value) / 100)));
          // });
        }}
        style={{ width: "100%" }}
      />
      {/* <button
        onClick={() => {
          setData(
            Array(2)
              .fill(undefined)
              .map((_, index) => {
                return {
                  value1: faker.number.int({ min: -100, max: 100 }),
                  value2: faker.number.int({ min: -100, max: 100 }),
                  value3: faker.number.int({ min: 0, max: 100 }),
                  value4: faker.number.int({ min: 0, max: 100 }),
                  x: String(1999 + index),
                };
              }),
          );
        }}
      >
        Change data
      </button> */}
    </div>
  );
};

const TestPieChart = () => {
  const [data, setData] = useState([
    { label: "value1", value: 1 },
    { label: "value2", value: 2 },
    { label: "value3", value: 3 },
  ]);
  const tooltipRef = useRef<{ setTrigger: Dispatch<React.SetStateAction<"hover" | "click">> }>();

  return (
    <>
      <PieChart width="100%" height="300px" data={data} dataKey="value">
        <Slice fill="red" dataIndex={0} />
        <Slice fill="green" dataIndex={1} />
        <Slice fill="blue" dataIndex={2} />
        {/* <PieChartTooltip render={<PieChartTooltip1 />} /> */}
        <TestPieChartTooltip ref={tooltipRef} />
      </PieChart>
      <button
        onClick={() => {
          setData([
            { label: "value1", value: Math.random() * 10 },
            { label: "value2", value: Math.random() * 10 },
            { label: "value3", value: Math.random() * 10 },
          ]);
        }}
      >
        Change data
      </button>
      <button
        onClick={() => {
          tooltipRef.current?.setTrigger((prev) => {
            if (prev === "click") {
              return "hover";
            } else {
              return "click";
            }
          });
        }}
      >
        Change trigger mode
      </button>
    </>
  );
};

const TestPieChartTooltip = forwardRef(function TestPieChartTooltip(props, ref) {
  const [trigger, setTrigger] = useState<"hover" | "click">("hover");

  useImperativeHandle(
    ref,
    () => {
      return {
        setTrigger: setTrigger,
      };
    },
    [],
  );

  return <PieChartTooltip mode={trigger} render={<PieChartTooltip1 />} />;
});

const PieChartTooltip1 = () => {
  const activeIndex = useChartStore((state) => {
    return state.activeIndex;
  });

  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid lightgray",
        width: "100px",
        wordBreak: "break-word",
      }}
    >
      {activeIndex}
      {/* <button style={{ pointerEvents: "auto" }}>Test</button> */}
    </div>
  );
};

const RadarChartTooltip1 = () => {
  const data = useChartStore((state) => {
    return state.data;
  });
  const activeIndex = useChartStore((state) => {
    return state.activeIndex;
  });

  if (!data?.length || activeIndex === undefined) {
    return;
  }

  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid lightgray",
        width: "100px",
        wordBreak: "break-word",
        // pointerEvents: "none",
      }}
    >
      {JSON.stringify(data[activeIndex])}
      {/* <button style={{ pointerEvents: "auto" }}>Test</button> */}
    </div>
  );
};

const TooltipContent = () => {
  const data = useChartStore((state) => {
    return state.data;
  });
  const activeIndex = useChartStore((state) => {
    return state.activeIndex;
  });

  if (!data?.length || activeIndex === undefined) {
    return null;
  }

  return (
    <div
      style={{
        padding: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid lightgray",
        width: "100px",
        wordBreak: "break-word",
      }}
    >
      {JSON.stringify(data[activeIndex])}
      <button
        style={{ pointerEvents: "auto" }}
        onClick={() => {
          alert("asdasdasd");
        }}
      >
        Test
      </button>
    </div>
  );
};

export default App;
