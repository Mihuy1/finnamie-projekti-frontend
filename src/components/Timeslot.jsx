import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditTimeSlot } from "./EditTimeSlot";
import { getTimeSlotImage, updateTimeSlot } from "../api/apiClient";
import toast from "react-hot-toast";
import configureLeaflet from "../utils/leaflet-config";
import { formatDateTimeDisplay } from "../utils/date-utils";
import { Carousel } from "./Carousel";

configureLeaflet();

export const TimeSlot = ({ slot, activities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [slotData, setSlotData] = useState(slot);
  const [images, setImages] = useState([]);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    console.log("Resolving image path:", path);
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://")) return path;
    if (path.startsWith("/")) return API_BASE_URL + path;
    return API_BASE_URL + "/" + path;
  };

  // Sync internal state if props change
  useEffect(() => {
    setSlotData(slot);
  }, [slot]);

  // fetch images for this timeslot
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await getTimeSlotImage(slot.id);

        if (res) {
          setImages(res.map((img) => img.url));
        }
      } catch (error) {
        console.error("Error fetching timeslot images:", error);
      }
    };

    fetchImages();
  }, [slot.id]);

  const toggleSlotDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (updatedData) => {
    try {
      const dataToSend = {
        ...updatedData,
        activity_ids: (updatedData.activities || []).map((a) => a.id),
      };

      // Clean up for API
      delete dataToSend.activities;

      const result = await toast.promise(updateTimeSlot(slot.id, dataToSend), {
        pending: "Updating timeslot...",
        success: "Timeslot updated successfully!",
        error: (err) => err.message || "Failed to update timeslot.",
      });

      if (result) {
        setSlotData(updatedData);
        toggleEditMode();
      }
    } catch (error) {
      console.error("Error saving timeslot:", error);
    }
  };

  return (
    <div className="profile-timeslots">
      {!isEditing ? (
        <article
          className={`profile-timeslot-card ${isExpanded ? "is-expanded" : ""}`}
        >
          <button
            type="button"
            className="profile-timeslot-summary"
            onClick={toggleSlotDetails}
            aria-expanded={isExpanded}
          >
            <div className="profile-timeslot-summary-main">
              <h3>{slotData.city || "Unknown City"}</h3>
              <p>{formatDateTimeDisplay(slotData.start_time)}</p>
            </div>

            <div className="profile-timeslot-summary-meta">
              <span className="profile-timeslot-pill">
                {slotData.type === "halfday" ? "Half Day" : "Full Day"}
              </span>
              <span
                className={`profile-timeslot-pill status-${(slotData.res_status || "unknown").toLowerCase()}`}
              >
                {slotData.res_status || "Unknown"}
              </span>
              <span className="profile-timeslot-chevron">
                {isExpanded ? "Hide details" : "View details"}
              </span>
            </div>
          </button>

          {isExpanded && (
            <div className="profile-timeslot-details">
              <div className="profile-timeslot-detail-grid">
                <div>
                  <strong>Start</strong>
                  <p>{formatDateTimeDisplay(slotData.start_time)}</p>
                </div>
                <div>
                  <strong>End</strong>
                  <p>{formatDateTimeDisplay(slotData.end_time)}</p>
                </div>
                <div>
                  <strong>Type</strong>
                  <p>{slotData.type === "halfday" ? "Half Day" : "Full Day"}</p>
                </div>
                <div>
                  <strong>Status</strong>
                  <p>{slotData.res_status || "Unknown"}</p>
                </div>
                <div className="profile-timeslot-activities">
                  <strong>Included Activities</strong>
                  {slotData.activities && slotData.activities.length > 0 ? (
                    <ul>
                      {slotData.activities.map((activity) => (
                        <li key={activity.id}>{activity.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No specific activities selected.</p>
                  )}
                </div>
              </div>

              {images && images.length > 0 && (
                <div className="profile-timeslot-images">
                  <strong>Timeslot Images</strong>
                  <Carousel images={images.map((img) => resolveImage(img))} />
                </div>
              )}

              {slotData.description && (
                <div className="profile-timeslot-description">
                  <strong>Description</strong>
                  <p>{slotData.description}</p>
                </div>
              )}

              <div className="profile-timeslot-map">
                <MapContainer
                  center={[slotData.latitude_deg, slotData.longitude_deg]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[slotData.latitude_deg, slotData.longitude_deg]}
                  >
                    <Popup>
                      <strong>{slotData.city}</strong>
                      <br />
                      {slotData.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="profile-timeslot-edit-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary profile-timeslot-edit-trigger"
                  onClick={toggleEditMode}
                >
                  Edit Timeslot
                </button>
              </div>
            </div>
          )}
        </article>
      ) : (
        <EditTimeSlot
          slot={slotData}
          activities={activities}
          images={images}
          onCancel={toggleEditMode}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
