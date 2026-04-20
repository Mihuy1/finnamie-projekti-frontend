import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditTimeSlot } from "./EditTimeSlot";
import {
  cancelReservationApi,
  confirmReservationApi,
  deleteExperienceById,
  deleteExperienceImageByIdAndUrl,
  updateExperience,
  uploadExperienceImage,
} from "../api/apiClient";
import toast, { Toaster } from "react-hot-toast";
import configureLeaflet from "../utils/leaflet-config";
import { Carousel } from "./Carousel";
import { ConfirmModal } from "./ConfirmModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SimpleModal } from "./SimpleModal";

configureLeaflet();

export const TimeSlot = ({
  slot,
  activities,
  canEdit,
  onClose,
  onUpdate,
  onDelete,
  reservations = null,
  setReservations,
}) => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [slotData, setSlotData] = useState(slot);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [showFeedbackId, setShowFeedbackId] = useState(null);

  const [reservationsData, setReservationsData] = useState(reservations);
  // Reset body overflow when component unmounts or modal closes
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const API_BASE_URL = "http://localhost:3000";
  const FALLBACK_IMAGE = "https://placehold.co/600x400";

  const resolveImage = (path) => {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith("http://")) return path;
    if (path.startsWith("/")) return API_BASE_URL + path;
    return API_BASE_URL + "/" + path;
  };

  const handleInfoButton = () => {
    setActiveTab(0);
  };

  const handleReservationButton = () => {
    setActiveTab(1);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  const handleConfirmReservation = async (r) => {
    const now = Date.now();
    const start = new Date(r.start_time).getTime();
    const end = new Date(r.end_time).getTime();

    let status = "upcoming";

    if (now < start) {
      status = "upcoming";
    } else if (now <= end) {
      status = "ongoing";
    } else {
      status = "ended";
    }

    try {
      await toast.promise(confirmReservationApi(r.reservation_id), {
        loading: "Confirming reservation...",
        success: (res) => res.message || "Reservation confirmed!",
        error: (err) => {
          return err?.message || "Failed to confirm reservation";
        },
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.reservation_id === r.reservation_id
            ? {
                ...reservation,
                booking_status: "confirmed",
                current_status: status,
              }
            : reservation,
        ),
      );

      setReservationsData((prev) =>
        prev.map((reservation) =>
          reservation.reservation_id === r.reservation_id
            ? {
                ...reservation,
                booking_status: "confirmed",
                current_status: status,
              }
            : reservation,
        ),
      );
    } catch (error) {
      console.error("Error confirming reservation:", error);
    }
  };

  const handleCancelReservation = async (r) => {
    await toast.promise(cancelReservationApi(r.reservation_id), {
      loading: "Canceling reservation...",
      success: (res) => res.message || "Reservation cancelled successfully!",
      error: (err) => {
        return err?.message || "Failed to cancel reservation";
      },
    });

    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.reservation_id === r.reservation_id
          ? {
              ...reservation,
              booking_status: "cancelled",
              current_status: "cancelled",
            }
          : reservation,
      ),
    );

    setReservationsData((prev) =>
      prev.map((reservation) =>
        reservation.reservation_id === r.reservation_id
          ? {
              ...reservation,
              booking_status: "cancelled",
              current_status: "cancelled",
            }
          : reservation,
      ),
    );
  };

  const filteredReservations = (reservationsData || []).filter(
    (reservation) => {
      const status = (reservation.booking_status || "").toLowerCase();

      return reservation.experience_id === slot.id && status !== "cancelled";
    },
  );

  if (showEmailVerificationModal) {
    return (
      <SimpleModal
        title="Email not verified"
        text="Please verify your email to book experiences."
        onClose={() => setShowEmailVerificationModal(false)}
      />
    );
  }

  const handleBookNow = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: "/reserve-activity",
          bookingData: slotData,
          from: location.pathname,
        },
      });
      return;
    }

    let currentUser = user;
    try {
      currentUser = (await refresh()) ?? user;
    } catch (error) {
      console.error("Failed to refresh auth before booking:", error);
    }

    if (!currentUser) {
      navigate("/login", {
        state: {
          redirectTo: "/reserve-activity",
          bookingData: slotData,
          from: location.pathname,
        },
      });
      return;
    }

    if (!currentUser.is_verified) {
      setShowEmailVerificationModal(true);
      return;
    }

    navigate("/reserve-activity", { state: { slot: slotData } });
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
    const newFiles = (images || []).filter((file) => file instanceof File);
    const removedImageUrls = (toRemoveImages || []).map((img) =>
      img.url.replace(API_BASE_URL, ""),
    );

    const savePromise = (async () => {
      const res = await updateExperience(slotData.id, updatedData);

      if (!res?.experience) {
        throw new Error("Failed to update experience");
      }

      let updatedResult = res.experience;

      if (removedImageUrls.length > 0) {
        await Promise.all(
          removedImageUrls.map(async (url) => {
            const deleted = await deleteExperienceImageByIdAndUrl(
              slotData.id,
              url,
            );

            if (!deleted) {
              throw new Error("Failed to delete one or more images");
            }
          }),
        );

        updatedResult = {
          ...updatedResult,
          images: (updatedResult.images || []).filter(
            (image) => !removedImageUrls.includes(image.url),
          ),
        };
      }

      if (newFiles.length > 0) {
        const upload = await uploadExperienceImage(slotData.id, newFiles);

        if (!upload?.files) {
          throw new Error("Failed to upload image(s)");
        }

        const newImageObjects = upload.files.map((file) => ({
          url: file.url,
        }));

        updatedResult = {
          ...updatedResult,
          images: [...(updatedResult.images || []), ...newImageObjects],
        };
      }

      setSlotData(updatedResult);
      onUpdate?.(updatedResult);
      setIsEditing(false);
      handleClose();

      return res.message || "Experience updated successfully";
    })();

    try {
      await toast.promise(savePromise, {
        loading: "Updating experience...",
        success: (message) => message,
        error: (err) => err?.message || "Failed to update experience",
      });
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
          onConfirm={() => handleDelete(slotData.id)}
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

            {slotData.images && (
              <div className="modal-image">
                <Carousel
                  images={slotData.images.map((img) => resolveImage(img.url))}
                />
              </div>
            )}

            {reservationsData && (
              <div className="tab-div">
                <button
                  className={`tab-div-btn ${activeTab === 0 ? "active" : ""}`}
                  onClick={handleInfoButton}
                >
                  Info
                </button>
                <button
                  className={`tab-div-btn ${activeTab === 1 ? "active" : ""}`}
                  onClick={handleReservationButton}
                >
                  Reservations
                </button>
              </div>
            )}

            {activeTab === 0 && (
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

                <div className="timeslot-modal-header">
                  <h3>{slotData.title || "Unknown Title"}</h3>
                  <p style={{ marginBottom: "0.5rem" }}>{slotData.city}</p>
                </div>

                <div className="profile-timeslot-detail-grid">
                  <div>
                    <strong>Start</strong>
                    <p>
                      {new Date(slotData.rule.start_date).toLocaleDateString()}
                    </p>
                    <p>{slotData.rule.start_time.slice(0, 5)}</p>
                  </div>
                  <div>
                    <strong>End</strong>
                    <p>
                      {new Date(slotData.rule.end_date).toLocaleDateString()}
                    </p>
                    <p>{slotData.rule.end_time.slice(0, 5)}</p>
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
                  <div className="modal-actions-timeslot">
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
            )}
            {activeTab === 1 && (
              <div className="timeslot-reservations">
                {filteredReservations.length === 0 ? (
                  <p>No reservations yet.</p>
                ) : (
                  <>
                    {filteredReservations.map((r) => (
                      <div
                        key={r.timeslot_id}
                        className="timeslot-reservation-card"
                      >
                        <div className="timeslot-reservation-card-top">
                          <h3>
                            {r.first_name} {r.last_name}{" "}
                          </h3>
                          <span
                            className={`BookingStatusPill Status-${r.current_status}`}
                          >
                            {r.current_status}
                          </span>
                        </div>
                        <p>
                          {new Date(r.start_time).toLocaleDateString(
                            undefined,
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            },
                          )}
                        </p>
                        <p>
                          {new Date(r.start_time).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {r.review_id && (
                          <div
                            className="GuestFeedbackPreview"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="FeedbackStars">
                              {"★".repeat(r.score)}
                              {"☆".repeat(5 - r.score)}
                              <span className="ScoreNumber">({r.score}/5)</span>
                            </div>
                            <p className="FeedbackContent">
                              "
                              {r.content ||
                                "The guest didn't leave a written comment, only a rating."}
                              "
                            </p>
                          </div>
                        )}

                        {(r.booking_status || "").toLowerCase() !==
                          "confirmed" && (
                          <div className="timeslot-reservation-card-bottom">
                            <button
                              className="ConfirmBookingBtn"
                              onClick={() => handleConfirmReservation(r)}
                            >
                              Confirm
                            </button>
                            <button
                              className="CancelBookingBtn"
                              onClick={() => {
                                handleCancelReservation(r);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
