import { useState, useMemo } from "react";
import AsyncSelect from "react-select/async";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { loadOptions } from "../api/apiClient";
import Select from "react-select";
import { formatDateTimeForInput } from "../utils/date-utils";
import { MultiImageUpload } from "./MultiImageUpload";
import Calendar from "react-calendar";

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

const API_BASE_URL = "http://localhost:3000";
const FALLBACK_IMAGE = "https://placehold.co/600x400";

export const EditTimeSlot = ({
  slot,
  activities,
  images,
  onCancel,
  onSave,
}) => {
  const initialFormData = useMemo(
    () => ({
      ...slot,
      address: slot.address || "",
      start_time: slot.rule.start_time,
      end_time: slot.rule.end_time,
      activities: slot.activities || [],
    }),
    [slot],
  );

  const [activeDate, setActiveDate] = useState(new Date());
  const [date, setDate] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedImages, setSelectedImages] = useState([]);
  const [toRemoveImages, setToRemoveImages] = useState([]);
  const [coords, setCoords] = useState([slot.latitude_deg, slot.longitude_deg]);

  images.map((path) => {
    console.log("path:", path.url);
  });

  const preselectedImageUrls = useMemo(
    () =>
      (images || []).map((path) => {
        if (!path.url) return FALLBACK_IMAGE;
        if (path.url.startsWith("http://") || path.url.startsWith("https://"))
          return path.url;
        if (path.url.startsWith("/")) return API_BASE_URL + path.url;
        return API_BASE_URL + "/" + path.url;
      }),
    [images],
  );

  const nextMonth = () => {
    setActiveDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setActiveDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleDates = (value) => {
    if (!value) {
      setDate([]);
      return;
    }
    const values = Array.isArray(value) ? value : [value];
    setDate(values);

    console.log(values);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (selected) => {
    if (selected) {
      const { lat, lon, addr } = selected.value;
      setCoords([lat, lon]);
      setFormData((prev) => ({
        ...prev,
        address: addr,
        latitude_deg: lat,
        longitude_deg: lon,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, selectedImages, toRemoveImages);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content profile-timeslot-edit-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal" onClick={onCancel}>
          x
        </button>
        <div className="profile-timeslot-edit-form">
          <h3 className="profile-timeslot-edit-title">Edit Timeslot</h3>

          <form
            onSubmit={handleSubmit}
            className="profile-form profile-timeslot-edit-profile-form"
          >
            <div className="modal-body-timeslot">
              <label>
                City
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Helsinki"
                />
              </label>

              <div className="date-picker-timeslot-edit">
                <label>
                  Date
                  <input
                    type="text"
                    onClick={() => setCalendarVisible(!calendarVisible)}
                    placeholder="Pick a date"
                    value={`${date ? date[0] + " - " + date[1] : "Pick a date"}`}
                    readOnly
                  />
                </label>
                {calendarVisible && (
                  <div className="calendar-container-timeslot-edit">
                    <div className="calendar-nav">
                      <button onClick={prevMonth}>&lsaquo;</button>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#002f6c",
                          fontSize: "16px",
                        }}
                      >
                        {activeDate.toLocaleString("en-GB", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button onClick={nextMonth}>&rsaquo;</button>
                    </div>

                    <Calendar
                      onChange={handleDates}
                      value={date}
                      activeStartDate={activeDate}
                      selectRange
                      onActiveStartDateChange={({ activeStartDate }) =>
                        setActiveDate(activeStartDate)
                      }
                      showNavigation={false}
                    />

                    <input
                      type="datetime-local"
                      name="start_time"
                      placeholder="Start Time"
                      value={formatDateTimeForInput(formData.start_time)}
                      onChange={handleInputChange}
                      required
                    />

                    <input
                      type="datetime-local"
                      name="end_time"
                      placeholder="End Time"
                      value={formatDateTimeForInput(formData.end_time)}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
              </div>

              <label>
                Activity Type
                <select
                  name="type"
                  className="profile-select"
                  value={formData.type || "halfday"}
                  onChange={handleInputChange}
                >
                  <option value="halfday">Half Day</option>
                  <option value="fullday">Full Day</option>
                </select>
              </label>

              <label>
                Reservation Status
                <select
                  name="res_status"
                  className="profile-select"
                  value={formData.res_status || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select status...</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="pending">Pending</option>
                </select>
              </label>

              <label>
                Activities
                <Select
                  isMulti
                  name="activities"
                  options={activities}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  className="profile-select"
                  classNamePrefix="select"
                  value={formData.activities}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      activities: selected || [],
                    }))
                  }
                  placeholder="Select activities..."
                />
              </label>

              <label className="profile-full-width">
                Description
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe what's included in this timeslot..."
                />
              </label>

              <MultiImageUpload
                slotId={slot.id}
                preselectedImages={preselectedImageUrls}
                setToRemoveImages={setToRemoveImages}
                onChange={setSelectedImages}
              />

              <div className="profile-full-width profile-timeslot-search-wrapper">
                <label className="profile-timeslot-search-label">
                  Location Search (Search for an address to update map)
                </label>

                <AsyncSelect
                  classNamePrefix="timeslot-address-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  onChange={handleAddressChange}
                  placeholder="Type to search address..."
                  defaultInputValue={formData.address}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length < 3
                      ? "Type at least 3 characters"
                      : "No results found"
                  }
                  loadingMessage={() => "Searching..."}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <div className="profile-full-width profile-timeslot-map profile-timeslot-map-edit">
                <MapContainer
                  center={coords}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ChangeView center={coords} />
                  <Marker position={coords} />
                </MapContainer>
              </div>

              <div className="profile-full-width profile-timeslot-edit-actions">
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
