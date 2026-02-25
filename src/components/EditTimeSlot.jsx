import { useState } from "react";
import AsyncSelect from "react-select/async";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { loadOptions } from "../api/apiClient";
import Select from "react-select";

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

export const EditTimeSlot = ({ slot, activities, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    ...slot,
    address: slot.address || "",
  });

  const [coords, setCoords] = useState([slot.latitude_deg, slot.longitude_deg]);

  console.log("formData:", formData);
  console.log("activities:", activities);

  const handleAddressChange = (selected) => {
    if (selected) {
      setCoords([selected.value.lat, selected.value.lon]);
      setFormData({
        ...formData,
        address: selected.value.addr,
        latitude_deg: selected.value.lat,
        longitude_deg: selected.value.lon,
      });
    }
  };

  return (
    <div className="profile-timeslot-edit-form">
      <div className="form-group profile-timeslot-edit-fields">
        <form className="profile-form profile-timeslot-edit-profile-form">
          <label>
            City
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />
          </label>

          <label>
            Start Time
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
              required
            />
          </label>

          <label>
            End Time
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
              required
            />
          </label>

          <label>
            Activity Type
            <select
              name="experience_length"
              className="profile-select"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="halfday">Half day</option>
              <option value="fullday">Full day</option>
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
                setFormData({ ...formData, activities: selected })
              }
            ></Select>
          </label>

          <label className="profile-full-width">
            Description
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </label>
        </form>

        <div className="profile-timeslot-search-wrapper">
          <label className="profile-timeslot-search-label">
            Location Search
          </label>
          <AsyncSelect
            classNamePrefix="timeslot-address-select"
            cacheOptions
            defaultValue={formData.address}
            loadOptions={loadOptions}
            onChange={handleAddressChange}
            placeholder="Search for an address..."
            defaultInputValue={formData.address}
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 3
                ? "Type at least 3 characters"
                : "No results found"
            }
            loadingMessage={() => "Searching addresses..."}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
        </div>
      </div>

      <div className="profile-timeslot-map profile-timeslot-map-edit">
        <MapContainer center={coords} zoom={14} style={{ height: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeView center={coords} />
          <Marker position={coords} />
        </MapContainer>
      </div>

      <div className="form-actions profile-timeslot-edit-actions">
        <button
          type="button"
          className="profile-btn profile-btn-primary"
          onClick={() => onSave(formData)}
        >
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
    </div>
  );
};
