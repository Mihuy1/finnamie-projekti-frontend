import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { EditTimeSlot } from "./EditTimeSlot";
import { updateTimeSlot } from "../api/apiClient";
import toast from "react-hot-toast";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const TimeSlot = ({ slot, activities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [slotData, setSlotData] = useState(slot);

  const toggleSlotDetails = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // if (isEditing) {
  //   return (
  //     <EditTimeSlot
  //       slot={slot}
  //       activities={activities}
  //       onCancel={toggleEditMode}
  //       onSave={async (updatedData) => {
  //         updatedData.activity_ids = updatedData.activities.map((a) => a.id);
  //         delete updatedData.activities;

  //         await toast.promise(updateTimeSlot(slot.id, updatedData), {
  //           pending: "Updating timeslot...",
  //           success: "Timeslot updated successfully!",
  //           error: "Failed to update timeslot.",
  //         });

  //         setSlotData(updatedData);

  //         toggleEditMode();
  //       }}
  //     />
  //   );
  // }
  return (
    <div className="profile-timeslots">
      {!isEditing && (
        <div className="profile-timeslot-list">
          <article
            key={slotData.id}
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
                <span className="profile-timeslot-pill">
                  {slot.type || "-"}
                </span>
                <span className="profile-timeslot-pill">
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
                    <p>{slotData.start_time}</p>
                  </div>
                  <div>
                    <strong>End</strong>
                    <p>{slotData.end_time}</p>
                  </div>
                  <div>
                    <strong>Activity</strong>
                    <p>{slotData.type || "-"}</p>
                  </div>
                  <div>
                    <strong>Status</strong>
                    <p>{slotData.res_status || "Unknown"}</p>
                  </div>
                </div>

                {slot.description && (
                  <div className="profile-timeslot-description">
                    <strong>Description</strong>
                    <p>{slotData.description}</p>
                  </div>
                )}

                <div className="profile-timeslot-map">
                  <MapContainer
                    center={[slotData.latitude_deg, slotData.longitude_deg]}
                    zoom={11}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[slotData.latitude_deg, slotData.longitude_deg]}
                    >
                      <Popup>
                        <p>City: {slotData.city}</p>
                        <p>Type: {slotData.type || "-"}</p>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary profile-timeslot-edit-trigger"
                  onClick={toggleEditMode}
                >
                  {isEditing ? "Cancel Edit" : "Edit Timeslot"}
                </button>
              </div>
            )}
          </article>
        </div>
      )}

      {isEditing && (
        <EditTimeSlot
          slot={slot}
          activities={activities}
          onCancel={toggleEditMode}
          onSave={async (updatedData) => {
            updatedData.activity_ids = updatedData.activities.map((a) => a.id);
            delete updatedData.activities;

            await toast.promise(updateTimeSlot(slot.id, updatedData), {
              pending: "Updating timeslot...",
              success: "Timeslot updated successfully!",
              error: "Failed to update timeslot.",
            });

            setSlotData(updatedData);

            toggleEditMode();
          }}
        />
      )}
    </div>
  );
};
