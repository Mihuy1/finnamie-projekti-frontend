import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditTimeSlot } from "./EditTimeSlot";
import {
  deleteExperienceById,
  deleteExperienceImageByIdAndUrl,
  updateExperience,
  uploadExperienceImage,
} from "../api/apiClient";
import toast from "react-hot-toast";
import configureLeaflet from "../utils/leaflet-config";
import { Carousel } from "./Carousel";
import { ConfirmModal } from "./ConfirmModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; //

configureLeaflet();

export const TimeSlot = ({
  slot,
  activities,
  canEdit,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [slotData, setSlotData] = useState(slot);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://")) return path;
    if (path.startsWith("/")) return API_BASE_URL + path;
    return API_BASE_URL + "/" + path;
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  const handleBookNow = () => {
    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: "/reserve-activity",
          bookingData: slotData,
          from: location.pathname,
        },
      });
    } else {
      navigate("/reserve-activity", { state: { slot: slotData } });
    }
  };

  const handleDelete = async (timeslotId) => {
    try {
      const res = await deleteExperienceById(timeslotId);

      if (!res.error) {
        toast.success("Timeslot deleted successfully!");
        onDelete?.(timeslotId);
        handleClose();
      }
    } catch (error) {
      console.error("Error deleting timeslot:", error);
      toast.error("Failed to delete timeslot");
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleEdit = async (updatedData, images, toRemoveImages) => {
    try {
      const result = await updateExperience(slot.id, updatedData, images);

      if (!result) return;

      let updatedResult = result.experience;

      if (toRemoveImages.length > 0) {
        for (const img of toRemoveImages) {
          img.url = img.url.replace(API_BASE_URL, "");
          const res = await deleteExperienceImageByIdAndUrl(slot.id, img.url);

          updatedResult = {
            ...updatedResult,
            images: (updatedResult.images || []).filter(
              (i) => i.url !== img.url,
            ),
          };

          if (!res) return;
        }
      }

      const newFiles = (images || []).filter((f) => f instanceof File);

      if (newFiles.length > 0) {
        const upload = await uploadExperienceImage(slot.id, newFiles);
        if (!upload || !upload.files) return;

        const newImageObjects = upload.files.map((file) => ({
          url: file.url,
        }));

        updatedResult = {
          ...updatedResult,
          images: [...(updatedResult.images || []), ...newImageObjects],
        };
      }

      if (result) {
        toast.success("Timeslot updated successfully!");
        setSlotData(updatedResult);
        onUpdate?.(updatedResult);
        setIsEditing(false);

        handleClose();
      }
    } catch (error) {
      console.error("Error saving timeslot:", error);
    }
  };

  if (isEditing) {
    return (
      <div className="profile-timeslots">
        <EditTimeSlot
          slot={slotData}
          activities={activities}
          images={slotData.images}
          onCancel={() => handleClose()}
          onSave={handleEdit}
        />
      </div>
    );
  }

  return (
    <div className="profile-timeslots">
      {confirmDelete && (
        <ConfirmModal
          text="Are you sure you want to delete this timeslot?"
          title="Delete Timeslot"
          confirmText="Delete"
          declineText="Cancel"
          onConfirm={() => handleDelete(slot.id)}
          onDecline={() => {
            setIsModalOpen(true);
            setConfirmDelete(false);
          }}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => handleClose()}>
          <div
            className="modal-content timeslot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={() => handleClose()}>
              ×
            </button>

            {slot.images && (
              <div className="modal-image">
                <Carousel
                  images={slot.images.map((img) => resolveImage(img.url))}
                />
              </div>
            )}

            <div className="modal-body">
              <div className="modal-meta">
                <span className="profile-timeslot-pill">
                  {slotData.type === "halfday" ? "Half Day" : "Full Day"}
                </span>
                {/* <span
                  className={`profile-timeslot-pill status-${(slotData.res_status || "unknown").toLowerCase()}`}
                >
                  {slotData.res_status || "Unknown"}
                </span> */}
              </div>

              <h3>{slotData.title || "Unknown Title"}</h3>
              <p style={{ marginBottom: "0.5rem" }}>{slotData.city}</p>

              <div className="profile-timeslot-detail-grid">
                <div>
                  <strong>Start</strong>
                  <p>{new Date(slot.rule.start_date).toLocaleDateString()}</p>
                  <p>{slot.rule.start_time.slice(0, 5)}</p>
                </div>
                <div>
                  <strong>End</strong>
                  <p>{new Date(slot.rule.end_date).toLocaleDateString()}</p>
                  <p>{slot.rule.end_time.slice(0, 5)}</p>
                </div>
              </div>

              {slotData.activities && slotData.activities.length > 0 && (
                <>
                  <hr />
                  <div className="profile-timeslot-activities">
                    <strong>Included Activities</strong>
                    <ul>
                      {slotData.activities.map((activity) => (
                        <li key={activity.id}>{activity.name}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {slotData.description && (
                <>
                  <hr />
                  <strong>Description</strong>
                  <p className="modal-description">{slotData.description}</p>
                </>
              )}

              <hr />
              <strong>Location</strong>
              {slotData.address && (
                <p className="modal-description">{slotData.address}</p>
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

              {canEdit ? (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditing(true);
                    }}
                  >
                    Edit Timeslot
                  </button>
                  <button
                    className="delete-timeslot-btn"
                    onClick={() => {
                      setIsModalOpen(false);
                      setConfirmDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="modal-actions">
                  <button onClick={handleBookNow} className="book-now-btn">
                    {location.pathname.includes("/discover")
                      ? "View available times"
                      : "Book this activity"}
                  </button>
                  <button className="close-btn" onClick={() => handleClose()}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
