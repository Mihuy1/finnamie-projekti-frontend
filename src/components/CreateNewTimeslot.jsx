import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Select from "react-select";
import { useEffect } from "react";
import {
  createTimeslot,
  getActivities,
  uploadTimeSlotImage,
} from "../api/apiClient";
import toast from "react-hot-toast";
import { loadOptions } from "../api/apiClient";
import AsyncSelect from "react-select/async";
import { MultiImageUpload } from "./MultiImageUpload";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 14);
  return null;
};

const DEFAULT_COORDS = [60.1699, 24.9384];

export const CreateNewTimeslot = ({ onSave, onClose }) => {
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    type: "",
    start_time: "",
    end_time: "",
    description: "",
    city: "",
    latitude_deg: "",
    longitude_deg: "",
    address: "",
    activity_ids: [],
    activities: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [toRemoveImages, setToRemoveImages] = useState([]);
  const [coords, setCoords] = useState([
    formData.latitude_deg,
    formData.longitude_deg,
  ]);

  const [activitiesData, setActivitiesData] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await getActivities();

      if (res && res.length > 0) setActivitiesData(res);
    };

    fetchActivities();
  }, []);

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
    console.log("called?");
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
    };

    const res = await createTimeslot(dataToSend);

    if (!res.timeslot) return;
    if (res.timeslot.id) {
      console.log("hey");
      const upload = await uploadTimeSlotImage(res.timeslot.id, selectedImages);

      console.log("upload:", upload);

      if (!upload) return;
    }

    toast.success("Timeslot created!");
    onSave?.(res.timeslot);
    onClose?.();
  };

  if (loading) return <p>loading...</p>;

  if (!user) return <p>No user...</p>;

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
                  City
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </label>
                <label>
                  Start Time
                  <input
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    type="datetime-local"
                    required
                  />
                </label>
                <label>
                  End Time
                  <input
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    type="datetime-local"
                  />
                </label>
                <label>
                  Activity Type
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="profile-select"
                    required
                  >
                    <option value="">Select status...</option>
                    <option value="Half-day">Half-day</option>
                    <option value="Full-day">Full-day</option>
                  </select>
                </label>
                <label>
                  Reservation Status
                  <select
                    name="res_status"
                    value={formData.res_status}
                    onChange={handleInputChange}
                    className="profile-select"
                    required
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
                <label className="profile-full-width">
                  Description
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe what's included in this timeslot..."
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
