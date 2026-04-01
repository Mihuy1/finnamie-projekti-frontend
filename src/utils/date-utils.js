export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};
export const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDateTimeDisplay = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatLocalDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!start || isNaN(start.getTime())) return "-";

  const startLabel = start.toLocaleDateString();
  if (!end || isNaN(end.getTime())) return startLabel;

  return `${startLabel} - ${end.toLocaleDateString()}`;
};

const formatLocalTime = (dateString, timeString, hour12) => {
  if (!timeString) return "-";

  const baseDate = dateString ? new Date(dateString) : new Date();
  if (isNaN(baseDate.getTime())) return timeString.slice(0, 5);

  const [hours = "0", minutes = "0", seconds = "0"] = timeString.split(":");
  baseDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);

  const options = {
    hour: "2-digit",
    minute: "2-digit",
  };

  if (typeof hour12 === "boolean") {
    options.hour12 = hour12;
  }

  return baseDate.toLocaleTimeString(undefined, options);
};

export const formatLocalTimeRange = (
  startDate,
  startTime,
  endDate,
  endTime,
  hour12,
) => {
  const startLabel = formatLocalTime(startDate, startTime, hour12);
  const endLabel = formatLocalTime(endDate || startDate, endTime, hour12);

  if (startLabel === "-" && endLabel === "-") return "-";
  return `${startLabel} - ${endLabel}`;
};
