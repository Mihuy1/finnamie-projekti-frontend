import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { EditTimeSlot } from "./EditTimeSlot";
import { updateTimeSlot } from "../api/apiClient";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const TimeSlot = ({ slot }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const toggleSlotDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isEditing) {
    return (
      <EditTimeSlot
        slot={slot}
        onCancel={toggleEditMode}
        onSave={async (updatedData) => {
          // Handle save logic here, e.g., call an API to update the timeslot
          console.log("Saving updated timeslot data:", updatedData);
          await updateTimeSlot(slot.id, updatedData);
          toggleEditMode();
        }}
      />
    );
  }
  return (
    <div className="profile-timeslots">
      <div className="profile-timeslot-list">
        <article
          key={slot.id}
          className={`profile-timeslot-card ${isExpanded ? "is-expanded" : ""}`}
        >
          <button
            type="button"
            className="profile-timeslot-summary"
            onClick={() => toggleSlotDetails(slot.id)}
            aria-expanded={isExpanded}
          >
            <div className="profile-timeslot-summary-main">
              <h3>{slot.city || "Unknown city"}</h3>
              <p>{slot.start_time}</p>
            </div>

            <div className="profile-timeslot-summary-meta">
              <span className="profile-timeslot-pill">{slot.type || "-"}</span>
              <span className="profile-timeslot-pill">
                {slot.res_status || "Unknown"}
              </span>
              <span className="profile-timeslot-chevron">
                {isExpanded ? "Hide details" : "View details"}
              </span>
            </div>
          </button>

          {isExpanded && (
            <div className="profile-timeslot-details">
              <div className="profile-timeslot-detail-grid">
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary profile-timeslot-edit-trigger"
                  onClick={toggleEditMode}
                >
                  {isEditing ? "Cancel Edit" : "Edit Timeslot"}
                </button>
                <div>
                  <strong>Start</strong>
                  <p>{slot.start_time}</p>
                </div>
                <div>
                  <strong>End</strong>
                  <p>{slot.end_time}</p>
                </div>
                <div>
                  <strong>Activity</strong>
                  <p>{slot.type || "-"}</p>
                </div>
                <div>
                  <strong>Status</strong>
                  <p>{slot.res_status || "Unknown"}</p>
                </div>
              </div>

              {slot.description && (
                <div className="profile-timeslot-description">
                  <strong>Description</strong>
                  <p>{slot.description}</p>
                </div>
              )}

              <div className="profile-timeslot-map">
                <MapContainer
                  center={[slot.latitude_deg, slot.longitude_deg]}
                  zoom={11}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[slot.latitude_deg, slot.longitude_deg]}>
                    <Popup>
                      <p>City: {slot.city}</p>
                      <p>Type: {slot.type || "-"}</p>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};
