import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import "./App.css";

type Range = {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

type CellResult = {
  cells: {
    date: Dayjs;
    isIncludeCurrentMonth: boolean;
    bgProps: {
      className: string;
    };
    subBgProps: {
      className: string;
    };
    mixedBgProps: {
      className: string;
    };
    buttonProps: {
      className: string;
    };
    wrapperProps: {
      onClick: () => void;
      onMouseEnter: () => void;
      onMouseLeave: () => void;
    };
  }[];
};

const useCalendarState = ({
  currentMonth,
  currentYear,
  hoveringDate,
  onClick,
  onMouseEnter,
  onMouseLeave,
  selectingMode,
  range,
  subRange,
}: {
  range?: Range;
  // setRange: (range: Range) => void,
  subRange?: Range;
  // setSubRange: (range: Range) => void,
  currentYear: number;
  currentMonth: number;
  selectingMode: "rangeStart" | "rangeEnd" | "subRangeStart" | "subRangeEnd";
  hoveringDate: Dayjs | null;
  onClick: (date: Dayjs) => void;
  onMouseEnter: (date: Dayjs) => void;
  onMouseLeave: (date: Dayjs) => void;
}): CellResult => {
  const firstDay = dayjs()
    .year(currentYear)
    .month(currentMonth - 1)
    .date(1);
  const lastDay = firstDay.endOf("month");
  const calendarStartDay = firstDay.startOf("week");
  const calendarEndDay = lastDay.endOf("week");

  const cells = [];
  let cursor = calendarStartDay.clone();
  // create only cells
  while (cursor.isBefore(calendarEndDay)) {
    const currentCursor = cursor.clone();
    const isIncludeCurrentMonth = currentCursor.isSame(firstDay, "month");
    const isIncludeRange = range?.startDate && range?.endDate;
    const isIncludeSubRange = subRange?.startDate && subRange?.endDate;
    const isIncludeHoveringDate =
      hoveringDate && currentCursor.isSame(hoveringDate, "date");
    const isIncludeSelectedDate =
      range?.startDate && currentCursor.isSame(range.startDate, "date");
    const isIncludeSelectedEndDate =
      range?.endDate && currentCursor.isSame(range.endDate, "date");
    const isIncludeSubRangeStartDate =
      subRange?.startDate && currentCursor.isSame(subRange.startDate, "date");
    const isIncludeSubRangeEndDate =
      subRange?.endDate && currentCursor.isSame(subRange.endDate, "date");
    const isIncludeSubRangeHoveringDate =
      hoveringDate && currentCursor.isSame(hoveringDate, "date");
    const isIncludeSubRangeSelectedDate =
      subRange?.startDate && currentCursor.isSame(subRange.startDate, "date");
    const isIncludeSubRangeSelectedEndDate =
      subRange?.endDate && currentCursor.isSame(subRange.endDate, "date");

    const isHovered = currentCursor.diff(hoveringDate, "date") === 0;
    const mainCellMode =
      range?.startDate && currentCursor.isSame(range.startDate, "date")
        ? "start"
        : range?.endDate && currentCursor.isSame(range.endDate, "date")
        ? "end"
        : range?.startDate &&
          range?.endDate &&
          currentCursor.isAfter(range.startDate, "date") &&
          currentCursor.isBefore(range.endDate, "date")
        ? "range"
        : "none";

    cells.push({
      date: currentCursor,
      isIncludeCurrentMonth,
      bgProps: {
        className: twMerge(
          "absolute w-9 h-8 top-0.5 left-0 right-0",
          mainCellMode === "start"
            ? "w-[34px] h-8 left-0.5 rounded-tl rounded-bl bg-gray-100"
            : mainCellMode === "end"
            ? "w-[34px] h-8 right-0.5 rounded-tr rounded-br bg-gray-100"
            : mainCellMode === "range"
            ? "bg-gray-100"
            : ""
          // isIncludeCurrentMonth ? "bg-gray-200" : "bg-gray-100"
        ),
      },
      subBgProps: {
        className: isIncludeSubRange ? "bg-blue-200" : "bg-blue-100",
      },
      mixedBgProps: {
        className:
          isIncludeRange && isIncludeSubRange ? "bg-green-200" : "bg-green-100",
      },
      buttonProps: {
        className: twMerge(
          "absolute w-8 h-8 left-0.5 top-0.5 flex items-center justify-center rounded select-none",
          isHovered && isIncludeCurrentMonth ? "bg-red-200" : ""
        ),
      },
      wrapperProps: {
        onClick: () => {
          onClick(currentCursor);
        },
        onMouseEnter: () => {
          if (isIncludeCurrentMonth) {
            onMouseEnter(currentCursor);
          }
        },
        onMouseLeave: () => {
          if (isIncludeCurrentMonth) {
            onMouseLeave(currentCursor);
          }
        },
      },
    });
    cursor = cursor.add(1, "day");
  }

  // do something
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {
    calendarYear: currentYear,
    calendarMonth: currentMonth,
    cells,
  } as any;
};

export default function App() {
  const [range, setRange] = useState({
    startDate: dayjs(),
    endDate: dayjs().add(6, "day"),
  });
  const [subRange, setSubRange] = useState({
    startDate: dayjs().add(-8, "day"),
    endDate: dayjs().add(-1, "day"),
  });
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(7);
  const [selectingMode, setSelectingMode] = useState<
    "rangeStart" | "rangeEnd" | "subRangeStart" | "subRangeEnd"
  >("rangeStart");
  const [hoveringDate, setHoveringDate] = useState<Dayjs | null>(null);

  const { cells: leftCalendarCells } = useCalendarState({
    range,
    subRange,
    currentYear,
    currentMonth,
    selectingMode, // 호버 상태 알기 위해.
    hoveringDate,
    onClick: (date) => {
      switch (selectingMode) {
        case "rangeStart":
          setRange((prev) => ({
            startDate: date,
            endDate: prev.endDate,
          }));
          setSelectingMode("rangeEnd");
          break;
        case "rangeEnd":
          setRange((prev) => ({
            startDate: prev.startDate,
            endDate: date,
          }));
          break;
        case "subRangeStart":
          setSubRange((prev) => ({
            startDate: date,
            endDate: prev.endDate,
          }));
          break;
        case "subRangeEnd":
          setSubRange((prev) => ({
            startDate: prev.startDate,
            endDate: date,
          }));
      }
      // setRange 또는 setSubRange (...)
      // setSelectingMode (...)
    },
    onMouseEnter: (date) => {
      setHoveringDate(date);
    },
    onMouseLeave: () => {
      setHoveringDate((prev) => (prev ? null : prev));
    },
  });

  useEffect(() => {
    console.log("leftCalendarCells", leftCalendarCells);
  }, [leftCalendarCells]);

  const { cells: rightCalendarCells } = useCalendarState({
    range,
    subRange,
    currentYear,
    currentMonth: currentMonth + 1,
    selectingMode, // 호버 상태 알기 위해.
    hoveringDate,
    onClick() {},
    onMouseEnter: (date) => {
      // setHoveringDate(date);
      // ...
    },
    onMouseLeave: (date) => {
      // setHoveringDate((prev) => if (prev) { return null});
    },
  });

  useEffect(() => {
    console.log("range", range);
  }, [range]);

  useEffect(() => {
    console.log("subRange", subRange);
  }, [subRange]);

  useEffect(() => {
    console.log("hoveringDate", hoveringDate?.format("YY.MM.DD"));
  }, [hoveringDate]);

  return (
    <div>
      <div>
        <button>
          {range.startDate.format("YY.MM.DD")} ~{" "}
          {range.endDate.format("YY.MM.DD")}
        </button>
        <button>
          {subRange.startDate.format("YY.MM.DD")} ~{" "}
          {subRange.endDate.format("YY.MM.DD")}
        </button>
      </div>
      <button onClick={() => setCurrentYear((prev) => prev - 1)}>왼쪽</button>
      <button onClick={() => setCurrentYear((prev) => prev + 1)}>오른쪽</button>
      <div className="flex items-center gap-4">
        <div className="flex w-[252px] flex-wrap">
          {["일", "월", "화", "수", "목", "금", "토"].map((week, index) => {
            return (
              <span
                className="w-9 h-9 flex items-center justify-center relative"
                key={index}
              >
                <span>{week}</span>
              </span>
            );
          })}
          {leftCalendarCells.map((cell) => {
            return (
              <span
                className="w-9 h-9 relative block"
                onMouseEnter={cell.wrapperProps.onMouseEnter}
                onMouseLeave={cell.wrapperProps.onMouseLeave}
                onClick={cell.wrapperProps.onClick}
              >
                <span {...cell.subBgProps}></span>
                <span {...cell.bgProps}></span>
                <span {...cell.mixedBgProps}></span>
                <span {...cell.buttonProps}>
                  {cell.isIncludeCurrentMonth && cell.date.get("date")}
                </span>
              </span>
            );
          })}
        </div>
        <div className="flex w-[252px] flex-wrap">
          {["일", "월", "화", "수", "목", "금", "토"].map((week, index) => {
            return (
              <span
                className="w-9 h-9 flex items-center justify-center relative"
                key={index}
              >
                <span>{week}</span>
              </span>
            );
          })}
          {rightCalendarCells.map((cell) => {
            return (
              <span
                className="w-9 h-9 flex relative"
                onMouseEnter={cell.wrapperProps.onMouseEnter}
                onMouseLeave={cell.wrapperProps.onMouseLeave}
                onClick={cell.wrapperProps.onClick}
              >
                <span {...cell.subBgProps}></span>
                <span {...cell.bgProps}></span>
                <span {...cell.mixedBgProps}></span>
                <span {...cell.buttonProps}>
                  {cell.isIncludeCurrentMonth && cell.date.get("date")}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// const cal2 = {
// 	currentYear,
// 	current
// 	onDateClick,
// 	cells: {
// 		date: Dayjs,
// 		isIncludeCurrentMonth: boolean,
// 		props: {
// 			data-is-hover: boolean;
// 		},
// 	}[],
// } = useCalendarState({
// 	range?: {startDate?: Dayjs, endDate?: Dayjs},
// 	subRange?: {startDate?: Dayjs, endDate?: Dayjs},
// 	currentYear: number,
// 	currentMonth: currentMonth + 1,
// });

{
  /* <div>
<button>{range.startDate.format(YY.MM.DD)} ~ {...}</button>
<button>{subRange.startDate.format(YY.MM.DD)} ~ {...}</button>
</div>

<button 왼쪽 onClick={() => {  currentYear, currentMonth 바꿔주기 }}>
<button 오른쪽 onClick={() => {  currentYear, currentMonth 바꿔주기 }}>

<div className="grid 7col">
{cells.map((cell) => {
	return <span
		{...cell.props}
			>
					{cell.isIncludeCurrentMonth && cell.date.get('date')}
			</span>;
	
}}
</div>

<div className="grid 7col">
{cells2.map((cell) => {
	return <span
		{...cell.props}
			>
					{cell.date.get('date')}
			</span>;
	
}}
</div>

  return (
    <div>


    </div>
  )
}

export default App */
}

// }
