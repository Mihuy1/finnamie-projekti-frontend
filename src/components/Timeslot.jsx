import { useEffect, useState } from "react";
import { getPublicUserInfo, getTimeSlotImage } from "../api/apiClient";
import "../styles/timeslot-styles.css";

export const TimeSlot = ({
  id,
  host_id,
  type,
  start_time,
  end_time,
  res_status,
  description,
  city,
  latitude_deg,
  longitude_deg,
  activity_type,
}) => {
  const [fullName, setFullName] = useState([]);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchFullName = async () => {
      const name = await getPublicUserInfo(host_id);

      if (name) setFullName(name);
    };

    const getImages = async () => {
      const fetchedImages = await getTimeSlotImage(id);

      if (Array.isArray(fetchedImages)) setImages(fetchedImages);
    };

    fetchFullName();
    getImages();
  }, [host_id, id]);

  const mainImageUrl =
    images.length > 0
      ? `http://localhost:3000${images[currentImageIndex].url}`
      : "https://placehold.co/150";

  console.log(`timeslot id: ${id} mainImageUrl ${mainImageUrl}`);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "status-available";
      case "pending":
        return "status-pending";
      case "booked":
        return "status-booked";
      default:
        return "";
    }
  };

  return (
    <div className="timeslot-card">
      <div className="timeslot-image-wrapper">
        <img
          src={mainImageUrl}
          alt={`Timeslot in ${city}`}
          className="timeslot-image"
          onClick={nextImage}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="timeslot-nav-button timeslot-prev-button"
              aria-label="Previous image"
            >
              ←
            </button>

            <button
              onClick={nextImage}
              className="timeslot-nav-button timeslot-next-button"
              aria-label="Next image"
            >
              →
            </button>

            <div className="timeslot-dot-container">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`timeslot-dot ${index === currentImageIndex ? "active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="timeslot-content">
        <header className="timeslot-header">
          <span className="timeslot-city">{city}</span>
          <span className="timeslot-type">{activity_type || type}</span>
        </header>

        <span className="timeslot-host">
          Hosted by {fullName.first_name} {fullName.last_name}
        </span>

        <p className="timeslot-description">{description}</p>

        <div className="timeslot-details">
          <div className="timeslot-info-item">
            <span>📅 {new Date(start_time).toLocaleDateString()}</span>
            <span>🕒 {new Date(start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="timeslot-info-item">
            <span className={`status-badge ${getStatusClass(res_status)}`}>
              {res_status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
