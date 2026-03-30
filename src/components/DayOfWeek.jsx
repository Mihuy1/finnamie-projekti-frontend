import "./DayOfWeek.css";

export const DayOfWeek = ({ selectedDays, setSelectedDays }) => {
  // Monday through Sunday UI order
  const daysConfig = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "S", value: 0 },
  ];

  const toggleDay = (val) => {
    const newSelection = [...selectedDays];
    // Toggle the specific index (0-6) based on day.value
    newSelection[val] = newSelection[val] === null ? val : null;
    setSelectedDays(newSelection);
  };

  return (
    <div className="day-selector-container">
      <div className="day-circles-row">
        {daysConfig.map((day) => {
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
    </div>
  );
};
