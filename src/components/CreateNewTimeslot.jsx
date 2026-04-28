// @ts-nocheck
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Select from "react-select";
import { useEffect } from "react";
import { createExperience, getActivities } from "../api/apiClient";
import toast from "react-hot-toast";
import { loadOptions } from "../api/apiClient";
import AsyncSelect from "react-select/async";
import { MultiImageUpload } from "./MultiImageUpload";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { DayOfWeek } from "./DayOfWeek";
import { SimpleModal } from "./SimpleModal";
import { municipalitiesOptions } from "../data/municipalities";

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

const DEFAULT_COORDS = [60.1699, 24.9384];

export const CreateNewTimeslot = ({ onSave, onClose }) => {
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    address: "",
    latitude_deg: "",
    longitude_deg: "",
    city: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    res_status: "",
    max_participants: 3,
    activity_ids: [],
    activities: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [_toRemoveImages, setToRemoveImages] = useState([]);
  const [coords, setCoords] = useState([
    formData.latitude_deg,
    formData.longitude_deg,
  ]);

  const [selectedDays, setSelectedDays] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [activitiesData, setActivitiesData] = useState([]);

  const currentYear = new Date().getFullYear();

  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await getActivities();

      if (res && res.length > 0) setActivitiesData(res);
    };

    fetchActivities();
  }, []);

  const calculateBitmask = (daysArray) => {
    return daysArray
      .filter((day) => day !== null)
      .reduce((acc, index) => acc + (1 << index), 0);
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

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      activity_ids: formData.activities.map((a) => a.id),
      weekdays_bitmask: calculateBitmask(selectedDays),
    };

    delete dataToSend.activities;

    const res = await createExperience(dataToSend, selectedImages);

    if (!res.experience) {
      toast.error("Failed to create experience!");
      return;
    }

    toast.success("Experience created!");
    onSave?.(res.experience);
    onClose?.();
  };

  if (loading) return <p>loading...</p>;

  if (!user) return <p>No user...</p>;

  if (!user.is_verified) {
    return (
      <SimpleModal
        title="Email not verified"
        text="Please verify your email to create experiences."
        onClose={onClose}
      />
    );
  }

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
    <div className="profile-timeslots">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => handleClose()}>
              ×
            </button>

            <div className="modal-body">
              <form className="profile-form" onSubmit={handleSubmit}>
                <label>
                  Title
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Fun tour around Espoo"
                    required
                  />
                </label>
                <label>
                  City
                  <Select
                    theme={customTheme}
                    options={municipalitiesOptions}
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
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    min={minDate}
                    max={maxDate}
                    required
                  />
                </label>

                <label>
                  End Date
                  <input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  Start Time
                  <input
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    type="time"
                    required
                  />
                </label>
                <label>
                  End Time
                  <input
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    type="time"
                  />
                </label>
                <label>
                  Experience Length
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="profile-select"
                    required
                  >
                    <option value="" disabled>
                      Select Length...
                    </option>
                    <option value="Half-day">Half-day</option>
                    <option value="Full-day">Full-day</option>
                  </select>
                </label>
                <label>
                  Activities
                  <Select
                    theme={customTheme}
                    isMulti
                    name="activities"
                    options={activitiesData}
                    value={formData.activities}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    className="profile-select"
                    classNamePrefix="select"
                    placeholder="Select activities..."
                    required
                    onChange={(option) =>
                      setFormData((prev) => ({ ...prev, activities: option }))
                    }
                  />
                </label>
                <label>
                  Max Participants
                  <input
                    type="number"
                    max={100}
                    placeholder="e.g. 10"
                    value={formData.max_participants}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_participants: Number(e.target.value),
                      }))
                    }
                    min={1}
                    required
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
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe the experience..."
                  />
                </label>

                <MultiImageUpload
                  setToRemoveImages={setToRemoveImages}
                  onChange={setSelectedImages}
                />

                <div className="profile-full-width profile-timeslot-search-wrapper">
                  <label className="profile-timeslot-search-label">
                    Location Search (Search for an address to update map)
                  </label>

                  <AsyncSelect
                    required
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
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#999",
                      }),
                      input: (base) => ({
                        ...base,
                        fontSize: "14px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "14px",
                      }),
                      control: (base) => ({
                        ...base,
                        minHeight: "40px",
                      }),
                    }}
                  />
                </div>

                {formData.address && (
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
                )}

                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                >
                  Submit
                </button>
                <button
                  className="profile-btn profile-btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
