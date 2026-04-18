import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createActivitySuggestion,
  getProfile,
  getReservations,
  loadCountries,
  resendVerificationEmail,
  updateProfile,
  uploadUserImage,
  cancelReservationApi,
  sendMessage,
  getTimeslotByIdWithExperience,
} from "../api/apiClient";
import isEmail from "validator/lib/isEmail";
import Select from "react-select";
import "leaflet/dist/leaflet.css";
import configureLeaflet from "../utils/leaflet-config";
import { formatDateForInput } from "../utils/date-utils";
import { TimeSlot } from "../components/Timeslot";
import { useAuth } from "../auth/AuthContext";
// import { Chatbox } from "../components/Chatbox";
import { CreateNewTimeslot } from "../components/CreateNewTimeslot";
import { useUserProfile } from "../hooks/useUserProfile";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ReviewModal } from "../components/ReviewModal";
//import { Reservation } from "../components/Reservation";
import { postReview } from "../api/apiClient";
import { Carousel } from "../components/Carousel";
import { PaymentButton } from "../components/PaymentButton";

const EMPTY_PROFILE = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  street_address: "",
  postal_code: "",
  city: "",
  country: "",
  date_of_birth: "",
  description: "",
  experience_length: "Both",
  role: "",
};

configureLeaflet();

export const Profile = () => {
  const { user, loading, refresh } = useAuth();
  const { hash } = useLocation();

  const {
    profile,
    setProfile,
    profileForm,
    setProfileForm,
    activitiesForm,
    isHost,
    timeSlots,
    setTimeSlots,
    isProfileLoading,
  } = useUserProfile(user, loading);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_new_password: "",
  });

  const [newActivitySuggestionForm, setNewActivitySuggestionForm] = useState({
    new_activity_suggestion: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [openChat, setOpenChat] = useState(false);

  const [showNewTimeslot, setShowNewTimeslot] = useState(false);

  const [countries, setCountries] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reservations, setReservations] = useState([]);

  const [reservation, setReservation] = useState({});

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showFeedbackId, setShowFeedbackId] = useState(null);

  const fetchTimeslotById = async (id) => {
    const data = await getTimeslotByIdWithExperience(id);

    console.log("data:", data);
    console.log("images:", data?.images?.length ?? 0);

    if (!data) return;
    setSelectedBooking(data);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".guest-wrapper")) {
        setShowCountryDropdown(false);
        setShowGenderDropdown(false);
        setShowExpDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const getCountries = async () => {
      try {
        const data = await loadCountries();
        setCountries(data);
      } catch (error) {
        console.error("Failed to load countries:", error);
      } finally {
        setLoadingCountries(false);
      }
    };

    getCountries();
  }, []);

  useEffect(() => {
    const getRes = async () => {
      try {
        const data = await getReservations();
        // console.log("Backend vastaus:", data);

        if (Array.isArray(data)) {
          setReservations(data);
        } else if (data && typeof data === "object") {
          if (data.error) {
            console.error("Server error:", data.error);
            setReservations([]);
          } else {
            setReservations([data]);
          }
        } else {
          setReservations([]);
        }
      } catch (err) {
        console.error("Failed to load reservations:", err);
        setReservations([]);
      }
    };
    getRes();
  }, []);

  useEffect(() => {
    if (hash === "#reservations") {
      setTimeout(() => {
        const element = document.getElementById("reservations-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [hash]);

  useEffect(() => {
    if (selectedSlot || showNewTimeslot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedSlot, showNewTimeslot]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setProfileForm({
      ...profile,
      host_activities: profile.host_activities || [],
    });
    setIsEditing(false);
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneNumberInputChange = (number) => {
    setProfileForm((prev) => ({
      ...prev,
      phone_number: number,
    }));
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!isEmail(profileForm.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    let userUpdate = {
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      email: profileForm.email,
      country: profileForm.country,
      date_of_birth: profileForm.date_of_birth,
      gender: profileForm.gender,
    };

    if (isHost) {
      userUpdate = {
        ...userUpdate,
        phone_number: profileForm.phone_number,
        street_address: profileForm.street_address,
        postal_code: profileForm.postal_code,
        city: profileForm.city,
        description: profileForm.description,
        experience_length: profileForm.experience_length,
        activity_ids: (profileForm.host_activities || []).map(
          (activity) => activity.id,
        ),
      };
    }

    try {
      await toast.promise(updateProfile(userUpdate), {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: (error) => error.message || "Failed to update profile",
      });

      setProfile({
        ...profileForm,
      });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.new_password || !passwordForm.confirm_new_password) {
      toast.error("Password cannot be empty");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      toast.error("Passwords do not match");
      return;
    }

    const newPasswords = {
      password: passwordForm.new_password,
      confirmPassword: passwordForm.confirm_new_password,
    };

    try {
      await toast.promise(updateProfile(newPasswords), {
        loading: "Updating password...",
        success: "Password updated successfully!",
        error: (error) => error.message || "Failed to update password",
      });

      setPasswordForm({
        new_password: "",
        confirm_new_password: "",
      });
    } catch (error) {
      console.error("Failed to update password", error);
    }
  };

  const handleActivitiesInputChange = (selectedOptions) => {
    setProfileForm((prev) => ({
      ...prev,
      host_activities: selectedOptions || [],
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date)) return "Date not found";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date)) return "";
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const uploadResult = await toast.promise(uploadUserImage(file), {
        loading: "Uploading image...",
        success: "Image uploaded successfully!",
        error: "Failed to upload image",
      });

      const uploadedImageUrl = uploadResult?.url;
      if (uploadedImageUrl) {
        setProfile((prev) => ({
          ...prev,
          image_url: uploadedImageUrl,
        }));
        setProfileForm((prev) => ({
          ...prev,
          image_url: uploadedImageUrl,
        }));
      }

      const updatedProfile = await getProfile();
      if (updatedProfile) {
        const formatted = {
          ...updatedProfile,
          date_of_birth: formatDateForInput(updatedProfile.date_of_birth),
        };
        setProfile(formatted);
        setProfileForm(formatted);
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      event.target.value = "";
    }
  };

  const handleOnUpdate = (updatedTimeslot) => {
    setTimeSlots((prev) =>
      prev.map((timeslot) =>
        timeslot.id === updatedTimeslot.id ? updatedTimeslot : timeslot,
      ),
    );
  };

  const handleNewTimeslot = (timeslot) => {
    setShowNewTimeslot(false);

    setTimeSlots((prev) => [...prev, timeslot]);
  };

  const handleCloseNewTimeslot = () => {
    setShowNewTimeslot(false);
  };

  const handleActivitySuggestionInput = (e) => {
    const { name, value } = e.target;

    setNewActivitySuggestionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActivitySuggestionSubmit = async (e) => {
    e.preventDefault();

    if (!newActivitySuggestionForm.new_activity_suggestion.trim()) {
      setAttemptedSubmit(true);
      toast.error("Please enter an activity name");
      return;
    }

    setAttemptedSubmit(false);

    await toast.promise(
      createActivitySuggestion(
        newActivitySuggestionForm.new_activity_suggestion,
      ),
      {
        loading: "Sending Activity Suggestion...",
        success: "Activity Suggestion Sent!",
        error: (e) => e.message,
      },
    );

    setNewActivitySuggestionForm({ new_activity_suggestion: "" });
  };

  const handleModalOpen = (reservation) => {
    setReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = async (submitted) => {
    if (submitted) {
      try {
        const data = await getReservations();
        setReservations(data);
      } catch (err) {
        console.error(err);
      }
    }
    setIsModalOpen(false);
  };

  const handleEmailVerificationSubmit = async () => {
    await toast.promise(resendVerificationEmail(profile.email), {
      loading: "Sending Verification Email...",
      success: (res) =>
        res.message || "Verification email sent! Please check your inbox.",
      error: (err) => {
        return err.message || "Failed to send verification email";
      },
    });
  };
  const handleCancelBooking = async (resId) => {
    if (!resId) return;

    const reservationToCancel = reservations.find(
      (r) => r.reservation_id === resId,
    );

    const targetConvId = reservationToCancel.conv_id;
    const title = reservationToCancel.title || "Experience";

    const receiverId = isHost
      ? reservationToCancel.guest_id
      : reservationToCancel.host_id;

    const confirmMsg = isHost
      ? "Are you sure you want to cancel this guest's booking?"
      : "Are you sure you want to cancel your reservation?";

    if (!window.confirm(confirmMsg)) return;

    setIsCancelling(true);

    try {
      await cancelReservationApi(resId);

      if (targetConvId && receiverId) {
        const cancelText = isHost
          ? `CANCELLED BY HOST\nThe host has cancelled the booking for: ${title}.`
          : `CANCELLED BY GUEST\nThe guest has cancelled their reservation for: ${title}.`;

        try {
          await sendMessage(targetConvId, receiverId, cancelText);
        } catch (msgErr) {
          console.error(msgErr);
        }
      }

      setReservations((prev) => prev.filter((r) => r.reservation_id !== resId));
      setSelectedSlot(null);
      toast.success("Cancelled and notified via chat");
    } catch (err) {
      toast.error(err.message || "Could not cancel reservation");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isProfileLoading)
    return <div className="profile-page">Loading profile data...</div>;

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const avatarLetter = (fullName[0] ?? "U").toUpperCase();

  return (
    <section className="profile-page">
      <div className="profile-card">
        <a className="back-link" href="/" data-discover="true">
          ← Back to Homepage
        </a>
        <div className="profile-header">
          <h1>Profile</h1>

          {!isEditing ? (
            <button
              className="profile-btn profile-btn-primary"
              onClick={handleEditProfile}
              type="button"
            >
              Edit Profile
            </button>
          ) : (
            <button
              className="profile-btn profile-btn-secondary"
              onClick={handleCancelEdit}
              type="button"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="profile-top">
          <div className="profile-avatar">
            {profile.image_url ? (
              <img
                className="avatar-img"
                src={`http://localhost:3000${profile.image_url}`}
                alt="Profile avatar"
                onClick={handleImageClick}
              />
            ) : (
              <div
                onClick={handleImageClick}
                className="profile-avatar-fallback"
              >
                {avatarLetter}
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div className="profile-top-info">
            <h2>{fullName || "Your Profile"}</h2>
            {profile.role && (
              <>
                <p className="profile-role">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </p>
                <div>
                  <p className={user.is_verified ? "verified" : "unverified"}>
                    {user.is_verified ? "Verified" : "Unverified"}{" "}
                  </p>
                  {!user.is_verified && (
                    <button
                      className="profile-btn profile-btn-primary"
                      onClick={handleEmailVerificationSubmit}
                    >
                      Send Verification
                    </button>
                  )}
                </div>
              </>
            )}
            {/*<button
              className="profile-btn profile-btn-primary"
              aria-label="Open chat"
              onClick={() => setOpenChat(true)}
            >
              Conversations
            </button>
            {openChat && <Chatbox closeChat={() => setOpenChat(false)} />}*/}
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSaveProfile}>
          <label>
            First name
            <input
              name="first_name"
              value={profileForm.first_name}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
              placeholder="First Name"
            />
          </label>

          <label>
            Last name
            <input
              name="last_name"
              value={profileForm.last_name}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
              placeholder="Last Name"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
              placeholder="Email Address"
            />
          </label>

          <label>
            Country
            <div className="guest-wrapper">
              <input
                type="text"
                className="guest-input"
                value={profileForm.country || ""}
                disabled={!isEditing}
                onFocus={() => {
                  if (!isEditing) return;
                  setFilteredCountries(
                    profileForm.country
                      ? countries.filter((c) =>
                          c
                            .toLowerCase()
                            .includes(profileForm.country.toLowerCase()),
                        )
                      : countries,
                  );
                  setShowCountryDropdown(true);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfileForm((prev) => ({ ...prev, country: val }));
                  setFilteredCountries(
                    countries.filter((c) =>
                      c.toLowerCase().includes(val.toLowerCase()),
                    ),
                  );
                }}
              />
              {isEditing && profileForm.country && (
                <button
                  type="button"
                  className="guest-clear-btn"
                  onClick={() =>
                    setProfileForm((prev) => ({ ...prev, country: "" }))
                  }
                >
                  ✕
                </button>
              )}
              {showCountryDropdown && isEditing && (
                <ul className="guest-dropdown">
                  {filteredCountries.map((c) => (
                    <li
                      key={c}
                      onMouseDown={() => {
                        setProfileForm((prev) => ({ ...prev, country: c }));
                        setShowCountryDropdown(false);
                      }}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>

          {isHost && (
            <label>
              City
              <input
                name="city"
                value={profileForm.city || ""}
                onChange={handleProfileInputChange}
                disabled={!isEditing}
                placeholder="City"
              />
            </label>
          )}

          <label>
            Date of birth
            <input
              name="date_of_birth"
              type="date"
              value={profileForm.date_of_birth}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
            />
          </label>

          <label>
            Gender
            <div className="guest-wrapper">
              <input
                type="text"
                className="guest-input"
                value={
                  profileForm.gender
                    ? profileForm.gender.charAt(0).toUpperCase() +
                      profileForm.gender.slice(1)
                    : "Not specified"
                }
                readOnly
                disabled={!isEditing}
                onClick={() =>
                  isEditing && setShowGenderDropdown(!showGenderDropdown)
                }
              />
              {showGenderDropdown && isEditing && (
                <ul className="guest-dropdown">
                  {["female", "male", "other"].map((g) => (
                    <li
                      key={g}
                      onMouseDown={() => {
                        setProfileForm((prev) => ({ ...prev, gender: g }));
                        setShowGenderDropdown(false);
                      }}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>

          {isHost && (
            <>
              <label>
                Phone number
                <PhoneInput
                  className="host-phone-input"
                  placeholder="Enter phone number"
                  defaultCountry="FI"
                  value={profileForm.phone_number}
                  onChange={handlePhoneNumberInputChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Street address
                <input
                  name="street_address"
                  value={profileForm.street_address || ""}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="Street Address"
                />
              </label>

              <label>
                Postal code
                <input
                  name="postal_code"
                  value={profileForm.postal_code || ""}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="Postal Code"
                />
              </label>

              <label>
                Experience length
                <div className="guest-wrapper">
                  <input
                    type="text"
                    className="guest-input"
                    value={profileForm.experience_length || "Both"}
                    readOnly
                    disabled={!isEditing}
                    onClick={() =>
                      isEditing && setShowExpDropdown(!showExpDropdown)
                    }
                  />
                  {showExpDropdown && isEditing && (
                    <ul className="guest-dropdown">
                      {["Half-day", "Full-day", "Both"].map((exp) => (
                        <li
                          key={exp}
                          onMouseDown={() => {
                            setProfileForm((prev) => ({
                              ...prev,
                              experience_length: exp,
                            }));
                            setShowExpDropdown(false);
                          }}
                        >
                          {exp}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>

              <label>
                Activities
                <Select
                  isMulti
                  name="activity_ids"
                  className="profile-select"
                  classNamePrefix="select"
                  value={profileForm.host_activities || []}
                  onChange={handleActivitiesInputChange}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  options={activitiesForm}
                  placeholder="Select your preferred activities"
                  isDisabled={!isEditing}
                />
              </label>

              <label className="profile-full-width">
                Description
                <textarea
                  name="description"
                  value={profileForm.description || ""}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="Tell something about yourself..."
                />
              </label>
            </>
          )}

          {isEditing && (
            <div className="profile-actions">
              <button className="profile-btn profile-btn-primary" type="submit">
                Save Changes
              </button>
            </div>
          )}
        </form>

        <hr className="profile-divider" />

        <h2 className="profile-section-title">Change password</h2>
        <form className="profile-password-form" onSubmit={handleChangePassword}>
          <label>
            New password
            <input
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordInputChange}
              placeholder="Enter new password"
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              name="confirm_new_password"
              value={passwordForm.confirm_new_password}
              onChange={handlePasswordInputChange}
              placeholder="Confirm new password"
            />
          </label>

          <div className="profile-actions">
            <button className="profile-btn profile-btn-primary" type="submit">
              Update Password
            </button>
          </div>
        </form>

        {isHost ? (
          <>
            <h2 className="profile-section-title">Suggest new activities</h2>
            <form
              className="profile-activity-suggestion-form"
              onSubmit={handleActivitySuggestionSubmit}
            >
              <label>
                Activity Name
                <input
                  type="text"
                  name="new_activity_suggestion"
                  className={
                    attemptedSubmit &&
                    !newActivitySuggestionForm.new_activity_suggestion.trim()
                      ? "input-error"
                      : ""
                  }
                  value={newActivitySuggestionForm.new_activity_suggestion}
                  onChange={(e) => {
                    handleActivitySuggestionInput(e);
                    if (attemptedSubmit) setAttemptedSubmit(false);
                  }}
                  placeholder="New Activity..."
                />
              </label>
              <div className="profile-action">
                <button
                  className="profile-btn profile-btn-primary"
                  type="submit"
                >
                  Add Suggestion
                </button>
              </div>
            </form>

            <hr className="profile-divider" />
            <h2 className="profile-section-title">Your Experiences</h2>

            {timeSlots.length === 0 ? (
              <p>You have no timeslots. Create some to get started!</p>
            ) : (
              <div className="profile-timeslot-list">
                {timeSlots.map((slot) => (
                  <article
                    className="profile-timeslot-card"
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="profile-timeslot-summary">
                      <div className="profile-timeslot-summary-main">
                        <h3>{slot.title || "Unknown Title"}</h3>
                        <p>{slot.city}</p>

                        <p>
                          {new Date(slot.rule.start_date).toLocaleDateString()}{" "}
                          - {new Date(slot.rule.end_date).toLocaleDateString()}
                        </p>
                        <p>
                          {slot.rule.start_time.slice(0, 5)} -{" "}
                          {slot.rule.end_time.slice(0, 5)}
                        </p>
                      </div>

                      <div className="profile-timeslot-summary-meta">
                        <span className="profile-timeslot-pill">
                          {slot.type === "halfday" ? "Half Day" : "Full Day"}
                        </span>
                        {/* <span
                          className={`profile-timeslot-pill status-${(slot.res_status || "unknown").toLowerCase()}`}
                        >
                          {slot.res_status || "Unknown"}
                        </span> */}
                        <span className="profile-timeslot-chevron">
                          View details
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {showNewTimeslot && (
              <CreateNewTimeslot
                onSave={handleNewTimeslot}
                onClose={handleCloseNewTimeslot}
              />
            )}
            <div className="create-timeslot-div">
              <button
                onClick={() => setShowNewTimeslot(true)}
                className="create-new-timeslot-btn"
              >
                Create Experience
              </button>
            </div>

            {isHost && (
              <>
                <hr className="profile-divider" />
                <h2 className="profile-section-title">Bookings from Guests</h2>

                <div className="BookingListContainer">
                  {reservations
                    // .filter((res) => res.booking_status === "confirmed")
                    .map((res) => {
                      const startDateTime = new Date(
                        res.start_time.replace(" ", "T"),
                      );
                      return (
                        <div
                          key={res.reservation_id}
                          className="BookingRowCard host-confirmed-card"
                          onClick={async () => {
                            setSelectedSlot(res);
                            setSelectedBooking(res);
                            const t = res.timeslot_id;
                            console.log("t:", t);
                            await fetchTimeslotById(res.timeslot_id);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="BookingRowHeader">
                            <span className="BookingTypeBadge">
                              {res.experience_length}
                            </span>
                            <span
                              className={`BookingStatusPill Status-${res.booking_status}`}
                            >
                              {res.booking_status}
                            </span>
                          </div>

                          <div className="BookingRowBody">
                            <div className="BookingTitleGroup">
                              <h3>{res.title}</h3>
                              <span className="BookingGuestText">
                                Guest:{" "}
                                <strong>
                                  {res.first_name} {res.last_name}
                                </strong>
                              </span>
                              <p className="BookingDateTag">
                                📅 {startDateTime.toLocaleDateString("en-GB")}
                              </p>
                            </div>
                          </div>
                          <div className="BookingRowFooter">
                            <span className="BookingActionLink">
                              View guest details →
                            </span>

                            {res.review_id && (
                              <button
                                className="BookingRateBtnInline feedback-view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowFeedbackId(
                                    showFeedbackId === res.reservation_id
                                      ? null
                                      : res.reservation_id,
                                  );
                                }}
                              >
                                {showFeedbackId === res.reservation_id
                                  ? "Close Feedback"
                                  : "Read Guest Feedback"}
                              </button>
                            )}
                          </div>

                          {showFeedbackId === res.reservation_id && (
                            <div
                              className="GuestFeedbackPreview"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="FeedbackStars">
                                {"★".repeat(res.score)}
                                {"☆".repeat(5 - res.score)}
                                <span className="ScoreNumber">
                                  ({res.score}/5)
                                </span>
                              </div>
                              <p className="FeedbackContent">
                                "
                                {res.content ||
                                  "The guest didn't leave a written comment, only a rating."}
                                "
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* {reservations.filter(
                    (res) => res.booking_status === "confirmed",
                  ).length === 0 && <p>No confirmed bookings yet.</p>} */}
                </div>
              </>
            )}
          </>
        ) : (
          // guest userille
          <>
            <div id="reservations-section">
              <hr className="profile-divider" />
              <h2 className="profile-section-title">Your Reservations</h2>

              {reservations && reservations.length > 0 ? (
                <div className="BookingListContainer">
                  {reservations.map((res) => {
                    const now = new Date();

                    const startDateTime = new Date(
                      res.start_time.replace(" ", "T"),
                    );
                    const endDateTime = new Date(
                      res.end_time.replace(" ", "T"),
                    );

                    const isPast = now > endDateTime;

                    const displayDate = startDateTime.toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    );

                    const startTime = startDateTime.toLocaleTimeString(
                      "en-GB",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );
                    const endTime = endDateTime.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={res.reservation_id}
                        className="BookingRowCard"
                        onClick={() => setSelectedSlot(res)}
                      >
                        <div className="BookingRowHeader">
                          <span className="BookingTypeBadge">
                            {res.experience_length}
                          </span>
                          <span
                            className={`BookingStatusPill Status-${res.booking_status}`}
                          >
                            {res.booking_status}
                          </span>
                        </div>

                        <div className="BookingRowBody">
                          <div className="BookingTitleGroup">
                            <h3>{res.title}</h3>
                            <span className="BookingHostText">
                              with {res.first_name} {res.last_name}
                            </span>
                          </div>

                          <div className="BookingMetaTags">
                            <span className="BookingLocationTag">
                              📍 {res.city}
                            </span>
                            <span className="BookingDateTag">
                              📅 {displayDate}
                            </span>
                            <span className="BookingTimeTag">
                              🕒 {startTime} - {endTime}
                            </span>
                          </div>
                        </div>

                        <div className="BookingRowFooter">
                          <span className="BookingActionLink">
                            View details →
                          </span>

                          {res.booking_status === "confirmed" && (
                            <button
                              className="BookingRateBtnInline"
                              disabled={!isPast}
                              title={
                                !isPast
                                  ? "You can rate this experience after it has ended"
                                  : ""
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPast) handleModalOpen(res);
                              }}
                            >
                              {!isPast
                                ? "Review locked"
                                : res.score || res.review_id
                                  ? "Edit Review"
                                  : "Rate Experience"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-reservations">
                  <p>You haven't made any reservations yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {selectedSlot && selectedSlot.rule && (
          <TimeSlot
            slot={selectedSlot}
            activities={activitiesForm}
            canEdit={true}
            onClose={() => setSelectedSlot(null)}
            onUpdate={(updatedTimeslot) => handleOnUpdate(updatedTimeslot)}
            onDelete={(deleteId) => {
              setTimeSlots((prev) =>
                prev.filter((timeslot) => timeslot.id !== deleteId),
              );
              setSelectedSlot(null);
            }}
            reservations={reservations}
          />
        )}

        {selectedSlot && selectedSlot.reservation_id && (
          <div className="BookingOverlay" onClick={() => setSelectedSlot(null)}>
            <div
              className="BookingModalWrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="BookingCloseBtn"
                onClick={() => setSelectedSlot(null)}
              >
                ×
              </button>

              {(() => {
                const now = new Date();
                const endDateTime = new Date(
                  selectedSlot.end_time.replace(" ", "T"),
                );
                const isPastEvent = now > endDateTime;

                return (
                  <div className="BookingDetailedCard">
                    <div className="BookingHeroImage">
                      <div className="modal-image">
                        <Carousel
                          images={
                            selectedBooking?.images
                              ? selectedBooking.images.map(
                                  (i) => "http://localhost:3000" + i.url,
                                )
                              : []
                          }
                        />
                      </div>

                      <div className="BookingBadgeContainer">
                        <span className="BookingDurationTag">
                          {selectedSlot.experience_length}
                        </span>
                        <span
                          className={`BookingStatusBadge Status-${selectedSlot.booking_status}`}
                        >
                          {selectedSlot.booking_status}
                        </span>
                      </div>
                    </div>

                    <div className="BookingDetailedContent">
                      <header className="BookingHeaderSection">
                        <span className="BookingHostName">
                          {isHost
                            ? `Guest: ${selectedSlot.first_name} ${selectedSlot.last_name}`
                            : `Host: ${selectedSlot.first_name} ${selectedSlot.last_name}`}
                        </span>
                        <h2 className="BookingMainTitle">
                          {selectedSlot.title}
                        </h2>
                        <p className="BookingLocationLabel">
                          📍 {selectedSlot.city}
                        </p>

                        {selectedSlot.description && (
                          <p className="BookingDescriptionText">
                            {selectedSlot.description}
                          </p>
                        )}
                      </header>

                      <div className="BookingInfoGrid">
                        <div className="InfoItem">
                          <span className="InfoLabel">Date</span>
                          <span className="InfoValue">
                            {new Date(
                              selectedSlot.start_time.replace(" ", "T"),
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="InfoItem">
                          <span className="InfoLabel">Time</span>
                          <span className="InfoValue">
                            {selectedSlot.start_time.slice(11, 16)} –{" "}
                            {selectedSlot.end_time.slice(11, 16)}
                          </span>
                        </div>
                      </div>

                      <div className="InfoItem full-width">
                        <span className="InfoLabel">Location</span>
                        <span className="InfoValue">
                          📍{" "}
                          {selectedSlot.address
                            ? `${selectedSlot.address}, `
                            : ""}
                          {selectedSlot.city}
                        </span>
                      </div>

                      <div
                        className="BookingActionsArea"
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {isHost && selectedSlot.review_id && (
                          <button
                            className="btn-read-feedback"
                            onClick={() => handleModalOpen(selectedSlot)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "12px",
                              backgroundColor: "#f0f7ff",
                              border: "1px solid #007bff",
                              borderRadius: "8px",
                              color: "#007bff",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            <span className="icon">⭐</span> Read Guest Feedback
                          </button>
                        )}

                        {!isHost &&
                          selectedSlot.booking_status === "confirmed" &&
                          isPastEvent && (
                            <button
                              className="BookingRateBtnInline"
                              onClick={() => handleModalOpen(selectedSlot)}
                            >
                              {selectedSlot.review_id
                                ? "Edit My Review"
                                : "Rate Experience"}
                            </button>
                          )}

                        {selectedSlot.booking_status === "confirmed" &&
                          !isPastEvent && (
                            <button
                              className="CancelBookingBtn"
                              onClick={() =>
                                handleCancelBooking(selectedSlot.reservation_id)
                              }
                            >
                              {isHost
                                ? "Cancel Guest's Booking"
                                : "Cancel My Reservation"}
                            </button>
                          )}
                      </div>

                      <div className="BookingFooterInfo">
                        <div className="ReferenceBox">
                          <span>Reference ID</span>
                          <code>{selectedSlot.reservation_id || "N/A"}</code>
                        </div>
                        <p className="RequestDate">
                          Reserved on {formatDate(selectedSlot.res_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {isModalOpen && (
          <ReviewModal
            isModalOpen={isModalOpen}
            closeModal={handleCloseModal}
            reservation={reservation}
            initialData={selectedSlot}
            isReadOnly={isHost}
          />
        )}
      </div>
    </section>
  );
};
