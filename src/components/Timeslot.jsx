import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditTimeSlot } from "./EditTimeSlot";
import {
  deleteExperienceById,
  deleteTimeslot,
  deleteTimeSlotImageByIdAndUrl,
  getTimeSlotImage,
  updateTimeSlot,
  uploadTimeSlotImage,
} from "../api/apiClient";
import toast from "react-hot-toast";
import configureLeaflet from "../utils/leaflet-config";
import { formatDateTimeDisplay } from "../utils/date-utils";
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
  const [images, setImages] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://")) return path;
    if (path.startsWith("/")) return API_BASE_URL + path;
    return API_BASE_URL + "/" + path;
  };

  // fetch images for this timeslot
  useEffect(() => {
    if (images.length > 0) return;
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

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  const handleBookNow = () => {
    const isDiscoverPage = location.pathname.includes("/discover");

    if (isDiscoverPage) {
      navigate("/book-activity", {
        state: {
          initialCategory: slotData.name,
          initialLocation: slotData.city,
        },
      });
      handleClose();
    } else {
      if (!user) {
        toast.error("Please login to book an activity");
        navigate("/login", {
          state: {
            from: location.pathname,
            redirectTo: "/reserve-activity",
            bookingData: slotData,
          },
        });
      } else {
        navigate("/reserve-activity", { state: { slot: slotData } });
      }
    }
  };

  const handleDelete = async (timeslotId) => {
    try {
      // const res = await deleteTimeslot(timeslotId);
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

  const handleSave = async (updatedData, images, toRemoveImages) => {
    try {
      const dataToSend = {
        ...updatedData,
        activity_ids: (updatedData.activities || []).map((a) => a.id),
      };

      // Clean up for API
      delete dataToSend.activities;

      const result = await updateTimeSlot(slot.id, dataToSend);

      if (!result) return;

      if (toRemoveImages.length > 0) {
        for (const img of toRemoveImages) {
          img.url = img.url.replace(API_BASE_URL, "");
          const res = await deleteTimeSlotImageByIdAndUrl(slot.id, img.url);

          if (!res) return;
        }
      }

      const newFiles = (images || []).filter((f) => f instanceof File);

      if (newFiles.length > 0) {
        const upload = await uploadTimeSlotImage(slot.id, newFiles);
        if (!upload) return;
      }

      if (result) {
        toast.success("Timeslot updated successfully!");
        setSlotData(updatedData);
        onUpdate?.(updatedData);
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
          images={images}
          onCancel={() => handleClose()}
          onSave={handleSave}
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

            {images && images.length > 0 && (
              <div className="modal-image">
                <Carousel images={images.map((img) => resolveImage(img))} />
              </div>
            )}

            <div className="modal-body">
              <div className="modal-meta">
                <span className="profile-timeslot-pill">
                  {slotData.type === "halfday" ? "Half Day" : "Full Day"}
                </span>
                <span
                  className={`profile-timeslot-pill status-${(slotData.res_status || "unknown").toLowerCase()}`}
                >
                  {slotData.res_status || "Unknown"}
                </span>
              </div>

              <h2>{slotData.city || "Unknown City"}</h2>

              <div className="profile-timeslot-detail-grid">
                <div>
                  <strong>Start</strong>
                  <p>{formatDateTimeDisplay(slotData.rule[0].start_time)}</p>
                </div>
                <div>
                  <strong>End</strong>
                  <p>{formatDateTimeDisplay(slotData.rule[0].end_time)}</p>
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
                  <h3>Description</h3>
                  <p className="modal-description">{slotData.description}</p>
                </>
              )}

              <hr />
              <h3>Location</h3>
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
