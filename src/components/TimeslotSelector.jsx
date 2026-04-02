import React, { useMemo, useState } from "react";
import "./TimeslotSelector.css";
import Calendar from "react-calendar";

function TimeslotSelector({
  timeslots,
  selectedId,
  setSelectedId,
  experience,
}) {
  const [activeDate, setActiveDate] = useState(() => {
    if (experience?.start_date) return new Date(experience.start_date);
    if (timeslots?.length) return new Date(timeslots[0].start_time);
    return new Date();
  });

  const experienceStart = experience?.rule.start_date
    ? new Date(experience.rule.start_date)
    : null;
  const experienceEnd = experience?.rule.end_date
    ? new Date(experience.rule.end_date)
    : null;

  const selectedTimeslot = timeslots?.find((ts) => ts.id === selectedId);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const futureTimeslots = useMemo(
    () => timeslots?.filter((ts) => new Date(ts.start_time) >= today) ?? [],
    [timeslots, today],
  );

  const availableMap = useMemo(() => {
    const map = {};

    futureTimeslots.forEach((ts) => {
      const d = new Date(ts.start_time);
      const key = toDateKey(d);
      map[key] = ts;
    });
    return map;
  }, [futureTimeslots]);

  const handleClick = (date) => {
    const key = toDateKey(date);
    const ts = availableMap[key];
    if (ts) setSelectedId(ts.id);
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    const key = toDateKey(date);
    return !availableMap[key];
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const key = toDateKey(date);
    return availableMap[key]
      ? "timeslot-calendar__tile--available"
      : "timeslot-calendar__tile--disabled";
  };

  const prevMonth = () => {
    setActiveDate((current) => {
      const targetDate = new Date(
        current.getFullYear(),
        current.getMonth() - 1,
        1,
      );

      if (experienceStart) {
        const minMonth = new Date(
          experienceStart.getFullYear(),
          experienceStart.getMonth(),
          1,
        );
        if (targetDate.getTime() < minMonth.getTime()) {
          return current;
        }
      }

      setSelectedId(null);
      return targetDate;
    });
  };

  const nextMonth = () => {
    setActiveDate((current) => {
      const targetDate = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1,
      );

      if (experienceEnd) {
        const maxMonth = new Date(
          experienceEnd.getFullYear(),
          experienceEnd.getMonth(),
          1,
        );
        if (targetDate.getTime() > maxMonth.getTime()) {
          return current;
        }
      }

      setSelectedId(null);
      return targetDate;
    });
  };

  return (
    <div className="timeslot-selector">
      <div className="calendar-nav">
        <button type="button" onClick={prevMonth} aria-label="Previous month">
          &lsaquo;
        </button>
        <span className="calendar-nav-label">
          {activeDate.toLocaleString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button type="button" onClick={nextMonth} aria-label="Next month">
          &rsaquo;
        </button>
      </div>
      <Calendar
        className="timeslot-calendar"
        activeStartDate={activeDate}
        onClickDay={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        showNavigation={false}
        value={selectedTimeslot ? new Date(selectedTimeslot.start_time) : null}
      />
    </div>
  );
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export default TimeslotSelector;
