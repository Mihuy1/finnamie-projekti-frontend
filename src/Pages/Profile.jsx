import { useEffect, useState } from "react";
import { getActivities, getProfile, updateProfile } from "../api/apiClient";

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
  experience_length: "",
  role: "",
};

export const Profile = () => {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_new_password: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const data = await getProfile();

      if (!data) {
        setError("failed to get profile");
        setLoading(false);
        return;
      }

      data.date_of_birth = data.date_of_birth.split("T")[0];

      if (data.role === "host") setIsHost(true);

      setActivities(await getActivities());

      setProfile(data);
      setProfileForm(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setProfileForm(profile);
    setIsEditing(false);
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
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
    let user = {
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      email: profileForm.email,
      country: profileForm.country,
      date_of_birth: profileForm.date_of_birth,
    };

    if (isHost) {
      user = {
        ...user,
        phone_number: profileForm.phone_number,
        street_address: profileForm.street_address,
        postal_code: profileForm.postal_code,
        city: profileForm.city,
        description: profileForm.description,
        experience_length: profileForm.experience_length,
      };
    }

    console.log("user:", user);

    const test = await updateProfile(user);

    console.log(test);

    if (!test) {
      setError("Failed To Update Profile");
      return;
    }

    setStatusMessage("Successfully updated profile!");
    setIsEditing(false);
  };

  const handleChangePassword = () => {};

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const avatarLetter = (fullName[0] ?? "U").toUpperCase();

  return (
    <section className="profile-page">
      <div className="profile-card">
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

        {loading && <p>Loading profile...</p>}
        {!!error && <p className="profile-error">{error}</p>}
        {!!statusMessage && <p className="profile-success">{statusMessage}</p>}

        <div className="profile-top">
          <div className="profile-avatar">
            {profile.image_url ? (
              <img
                className="avatar-img"
                src={profile.image_url}
                alt="Profile avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">{avatarLetter}</div>
            )}
          </div>

          <div className="profile-top-info">
            <h2>{fullName || "Your Profile"}</h2>
            <p className="profile-role">Role: {profile.role || "Not set"}</p>
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
            />
          </label>

          <label>
            Last name
            <input
              name="last_name"
              value={profileForm.last_name}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
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
            />
          </label>

          <label>
            Country
            <input
              name="country"
              value={profileForm.country}
              onChange={handleProfileInputChange}
              disabled={!isEditing}
            />
          </label>

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

          {isHost && (
            <>
              <label>
                Phone number
                <input
                  name="phone_number"
                  value={profileForm.phone_number}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Street address
                <input
                  name="street_address"
                  value={profileForm.street_address}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                Postal code
                <input
                  name="postal_code"
                  value={profileForm.postal_code}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={profileForm.city}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                />
              </label>
              <label>
                Experience length
                <select
                  name="experience_length"
                  className="profile-select"
                  value={profileForm.experience_length}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
                >
                  <option value="Half-day">Half-day</option>
                  <option value="Full-day">Full-day</option>
                  <option value="Both">Both</option>
                </select>
              </label>
              <label className="profile-full-width">
                Description
                <textarea
                  name="description"
                  value={profileForm.description ? profileForm.description : ""}
                  onChange={handleProfileInputChange}
                  disabled={!isEditing}
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
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              name="confirm_new_password"
              value={passwordForm.confirm_new_password}
              onChange={handlePasswordInputChange}
            />
          </label>

          <div className="profile-actions">
            <button className="profile-btn profile-btn-primary" type="submit">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
