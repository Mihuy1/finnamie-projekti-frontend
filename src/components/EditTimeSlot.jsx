import { useState, useMemo } from "react";
import AsyncSelect from "react-select/async";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { loadOptions } from "../api/apiClient";
import Select from "react-select";
import { formatDateTimeForInput } from "../utils/date-utils";

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

export const EditTimeSlot = ({ slot, activities, onCancel, onSave }) => {
  const initialFormData = useMemo(
    () => ({
      ...slot,
      address: slot.address || "",
      start_time: formatDateTimeForInput(slot.start_time),
      end_time: formatDateTimeForInput(slot.end_time),
      activities: slot.activities || [],
    }),
    [slot],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [coords, setCoords] = useState([slot.latitude_deg, slot.longitude_deg]);

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
    onSave(formData);
  };

  return (
    <div className="profile-timeslot-edit-form">
      <h3 className="profile-timeslot-edit-title">Edit Timeslot</h3>

      <form
        onSubmit={handleSubmit}
        className="profile-form profile-timeslot-edit-profile-form"
      >
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

        <label>
          Start Time
          <input
            type="datetime-local"
            name="start_time"
            value={formatDateTimeForInput(formData.start_time)}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          End Time
          <input
            type="datetime-local"
            name="end_time"
            value={formatDateTimeForInput(formData.end_time)}
            onChange={handleInputChange}
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
              setFormData((prev) => ({ ...prev, activities: selected || [] }))
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
          <button type="submit" className="profile-btn profile-btn-primary">
            Save Changes
          </button>
          <button
            type="button"
            className="profile-btn profile-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
