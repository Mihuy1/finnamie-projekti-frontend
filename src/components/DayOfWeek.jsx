import React, { useState } from "react";
import "./DayOfWeek.css"; // Import your separate CSS file

export const DayOfWeek = ({ selectedDays, setSelectedDays }) => {
  // Monday through Sunday UI order
  const daysConfig = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "S", value: 0 }, // Sunday is 0 for our backend logic
  ];

  const toggleDay = (val) => {
    const newSelection = [...selectedDays];
    // Toggle the specific index (0-6) based on day.value
    newSelection[val] = newSelection[val] === null ? val : null;
    setSelectedDays(newSelection);
  };

  const calculateBitmask = (daysArray) => {
    return daysArray
      .filter((day) => day !== null)
      .reduce((acc, index) => acc + (1 << index), 0);
  };

  return (
    <div className="day-selector-container">
      <h3 className="day-selector-label">Days of the week</h3>

      <div className="day-circles-row">
        {daysConfig.map((day) => {
          // Check if this specific day value is currently selected
          const isActive = selectedDays[day.value] !== null;

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={isActive ? "day-button active" : "day-button"}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div className="bitmask-display">
        Selected Bitmask:{" "}
        <span className="bitmask-number">{calculateBitmask(selectedDays)}</span>
      </div>
    </div>
  );
};
