import { useEffect, useRef, useState } from "react";
import { getActivities, getProfile, updateProfile } from "../api/apiClient";
import isEmail from "validator/lib/isEmail";
import toast from "react-hot-toast";
import Select from "react-select";

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
  const hasFetchedProfile = useRef(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [activitiesForm, setActivitiesForm] = useState([]);

  useEffect(() => {
    if (hasFetchedProfile.current) {
      return;
    }
    hasFetchedProfile.current = true;

    const fetchData = async () => {
      setLoading(true);

      const data = await toast.promise(getProfile(), {
        pending: "Loading Profile Data",
        success: "Profile loaded!",
        error: "Failed to get profile data",
      });

      data.date_of_birth = data.date_of_birth.split("T")[0];

      if (data.role === "host") setIsHost(true);

      const activitiesData = await getActivities();
      const hostActivities = data.host_activities || [];

      setActivitiesForm(activitiesData);

      setProfile({
        ...data,
        host_activities: hostActivities,
      });
      setProfileForm({
        ...data,
        host_activities: hostActivities,
      });
      setLoading(false);
    };

    fetchData();
  }, []);

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
        activity_ids: (profileForm.host_activities || []).map(
          (activity) => activity.id,
        ),
      };
    }

    if (!isEmail(user.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      await updateProfile(user);
      setProfile({
        ...profileForm,
        host_activities: profileForm.host_activities || [],
      });
      toast.success("Profile Updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
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
        pending: "Updating password...",
        success: "Password updated successfully!",
        error: (error) => error.message || "Failed to update password",
      });

      setPasswordForm({
        new_password: "",
        confirm_new_password: "",
      });
    } catch {
      console.error("Failed to update password");
    }
  };

  const handleActivitiesInputChange = (selectedOptions) => {
    const nextActivities = selectedOptions || [];

    setProfileForm((prev) => ({
      ...prev,
      host_activities: nextActivities,
    }));
  };

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
                  placeholder="Select your preffered activities"
                  isDisabled={!isEditing}
                />
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
