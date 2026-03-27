import { useEffect, useRef, useState } from "react";
import {
  createActivitySuggestion,
  createExperience,
  getProfile,
  getReservations,
  loadCountries,
  updateProfile,
  uploadUserImage,
} from "../api/apiClient";
import isEmail from "validator/lib/isEmail";
import Select from "react-select";
import "leaflet/dist/leaflet.css";
import configureLeaflet from "../utils/leaflet-config";
import {
  formatDateForInput,
  formatDateTimeDisplay,
  formatDateTimeForInput,
} from "../utils/date-utils";
import { TimeSlot } from "../components/Timeslot";
import { useAuth } from "../auth/AuthContext";
import { Chatbox } from "../components/Chatbox";
import { CreateNewTimeslot } from "../components/CreateNewTimeslot";
import { useUserProfile } from "../hooks/useUserProfile";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ReviewModal } from "../components/ReviewModal";
import { Reservation } from "../components/Reservation";

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
  const { user, loading } = useAuth();

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
        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reservations:", err);
        setReservations([]);
      }
    };
    getRes();
  }, []);

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

      // Sync with full profile data to be safe
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
              <p className="profile-role">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </p>
            )}
            <button
              className="profile-btn profile-btn-primary"
              aria-label="Open chat"
              onClick={() => setOpenChat(true)}
            >
              Conversations
            </button>
            {openChat && <Chatbox closeChat={() => setOpenChat(false)} />}
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
            <select
              name="country"
              value={profileForm.country}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
            >
              {loadingCountries ? (
                <option value="" disabled>
                  Loading countries...
                </option>
              ) : (
                <>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </>
              )}
            </select>
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
            <select
              name="gender"
              value={profileForm.gender}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>

          {isHost && (
            <>
              <label>
                Phone number
                {/* <input
                  name="phone_number"
                  value={profileForm.phone_number || ""}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                  placeholder="Phone Number"
                /> */}
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
                <select
                  name="experience_length"
                  className="profile-select"
                  value={profileForm.experience_length || "Both"}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                >
                  <option value="Half-day">Half-day</option>
                  <option value="Full-day">Full-day</option>
                  <option value="Both">Both</option>
                </select>
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
                  value={newActivitySuggestionForm.new_activity_suggestion}
                  onChange={handleActivitySuggestionInput}
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
            <h2 className="profile-section-title">Your Timeslots</h2>

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
                        <h3>{slot.city || "Unknown City"}</h3>
                        <p>
                          {slot.rule.start_date} - {slot.rule.end_date}
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
                        <span
                          className={`profile-timeslot-pill status-${(slot.res_status || "unknown").toLowerCase()}`}
                        >
                          {slot.res_status || "Unknown"}
                        </span>
                        <span className="profile-timeslot-chevron">
                          View details
                        </span>
                      </div>
                    </div>
                  </article>
                ))}

                {selectedSlot && (
                  <TimeSlot
                    slot={selectedSlot}
                    activities={activitiesForm}
                    canEdit={true}
                    onClose={() => setSelectedSlot(null)}
                    onUpdate={(updatedTimeslot) =>
                      handleOnUpdate(updatedTimeslot)
                    }
                    onDelete={(deleteId) => {
                      setTimeSlots((prev) =>
                        prev.filter((timeslot) => timeslot.id !== deleteId),
                      );
                      setSelectedSlot(null);
                    }}
                  />
                )}
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
                Create new timeslot
              </button>
            </div>
          </>
        ) : (
          // guest userille
          <>
            {reservations && reservations.length > 0 ? (
              <>
                <hr className="profile-divider" />
                <h2 className="profile-section-title">Your Reservations</h2>
                <div className="profile-timeslot-list">
                  {reservations.map((res) => (
                    <Reservation
                      key={res.reservation_id}
                      inPast={new Date() >= new Date(res.res_date)}
                      formattedDate={formatDateTimeDisplay(res.res_date).split(
                        ",",
                      )}
                      reservation={res}
                      handleModalOpen={handleModalOpen}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-reservations">
                <hr className="profile-divider" />
                <h2 className="profile-section-title">Reservations</h2>
                <p>You haven't made any reservations yet.</p>
              </div>
            )}

            {isModalOpen && (
              <ReviewModal
                isModalOpen={isModalOpen}
                closeModal={handleCloseModal}
                reservation={reservation}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};
