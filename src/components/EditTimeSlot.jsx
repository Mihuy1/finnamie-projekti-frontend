import { useState, useMemo, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { getTimeslotsByRuleId, loadOptions } from "../api/apiClient";
import Select, { createFilter } from "react-select";
import { MultiImageUpload } from "./MultiImageUpload";
import { DayOfWeek } from "./DayOfWeek";
import { municipalitiesOptions } from "../data/municipalities";

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

  const [formData, setFormData] = useState(initialFormData);
  const [expereienceTimeslots, setExperienceTimeslots] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [toRemoveImages, setToRemoveImages] = useState([]);
  const [coords, setCoords] = useState([slot.latitude_deg, slot.longitude_deg]);

  useEffect(() => {
    const getExperienceTimeslots = async () => {
      const data = await getTimeslotsByRuleId(slot.rule.id);
      console.log("fetched timeslots for rule:", data);
      setExperienceTimeslots(data || []);
    };

    getExperienceTimeslots();
  }, []);

  const bitmaskToState = (bitmask) => {
    // Create an array of 7 elements
    return Array.from({ length: 7 }, (_, i) => {
      // Check if the bit at position 'i' is set in the bitmask
      // (1 << i) creates the value for that day (1, 2, 4, 8, 16, 32, 64)
      const isSelected = (bitmask & (1 << i)) !== 0;

      // If selected, return the index (0-6), otherwise return null
      return isSelected ? i : null;
    });
  };

  const [selectedDays, setSelectedDays] = useState(
    bitmaskToState(slot.rule.weekdays_bitmask),
  );

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

  const calculateBitmask = (daysArray) => {
    return daysArray
      .filter((day) => day !== null)
      .reduce((acc, index) => acc + (1 << index), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRuleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      rule: {
        ...prev.rule,
        [name]: value,
      },
    }));
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

    const dataToSend = {
      ...formData,
      rule: {
        ...formData.rule,
        weekdays_bitmask: calculateBitmask(selectedDays),
      },
      activity_ids: formData.activities.map((a) => a.id),
    };

    delete dataToSend.activities;

    onSave(dataToSend, selectedImages, toRemoveImages);
  };

  const customTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,

      // borderColor: "rgba(170, 0, 162, 0.45)",

      // Primary brand color (selected option, focus border, etc.)
      // primary: "rgba(170, 0, 162, 1)",
      primary: "rgba(170, 0, 162, 0.45)",

      // Hovered option background
      primary25: "rgba(150, 0, 140, 0.15)",

      // Active/pressed option
      primary50: "rgba(150, 0, 140, 0.3)",

      // Main background
      neutral0: "#ffffff",

      // Default text
      neutral80: "rgba(0, 47, 108, 1)",

      // Placeholder / muted text
      neutral50: "rgba(72, 104, 145, 1)",

      // Borders
      neutral20: "rgba(0, 47, 108, 0.2)",
      neutral30: "rgba(0, 47, 108, 0.4)",
    },
  });
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content profile-timeslot-edit-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal" onClick={onCancel}>
          ×
        </button>
        <div className="profile-timeslot-edit-form">
          <h3 className="profile-timeslot-edit-title">Edit Timeslot</h3>

          <form
            onSubmit={handleSubmit}
            className="profile-form profile-timeslot-edit-profile-form"
          >
            <div className="modal-body-timeslot">
              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Morning Paddleboarding"
                />
              </label>
              <label>
                City
                {/* <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Helsinki"
                /> */}
                <Select
                  theme={customTheme}
                  options={municipalitiesOptions}
                  filterOption={createFilter({
                    ignoreAccents: false,
                  })}
                  name="cities"
                  value={
                    formData.city
                      ? {
                          label: formData.city,
                          value: formData.city.toLowerCase(),
                        }
                      : ""
                  }
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  className="profile-select"
                  classNamePrefix="select"
                  required
                  onChange={(option) => {
                    setFormData((prev) => ({
                      ...prev,
                      city: option.label,
                    }));
                  }}
                />
              </label>

              <label>
                Start Date
                <input
                  type="date"
                  name="start_date"
                  value={formData.rule.start_date || ""}
                  onChange={handleRuleInputChange}
                  required
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  name="end_date"
                  value={formData.rule.end_date || ""}
                  onChange={handleRuleInputChange}
                  required
                />
              </label>

              <label>
                Start Time
                <input
                  type="time"
                  name="start_time"
                  value={formData.rule.start_time || ""}
                  onChange={handleRuleInputChange}
                  required
                />
              </label>
              <label>
                End Time
                <input
                  type="time"
                  name="end_time"
                  value={formData.rule.end_time || ""}
                  onChange={handleRuleInputChange}
                  required
                />
              </label>

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

              {/* <label>
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
              </label> */}

              <label>
                Activities
                <Select
                  theme={customTheme}
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

              <label>
                Max Participants
                <input
                  type="number"
                  name="max_participants"
                  value={formData.rule.max_participants || ""}
                  onChange={handleRuleInputChange}
                  min={1}
                  placeholder="e.g. 10"
                  max={100}
                />
              </label>

              <label>
                Days of the week
                <DayOfWeek
                  selectedDays={selectedDays}
                  setSelectedDays={setSelectedDays}
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

              <div className="timeslot-separate-list">{}</div>

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
