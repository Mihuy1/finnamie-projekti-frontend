import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicUserInfo, getTimeSlotsByHostId } from "../api/apiClient";
import { TimeSlot } from "../components/Timeslot";
import { Chatbox } from "../components/Chatbox";

export const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getPublicUserInfo(id);

        if (!res) {
          console.error("Profile not found");
          return;
        }

        if (res.role === "host") {
          // fetch timeslot by host id
          const timeSlotsRes = await getTimeSlotsByHostId();

          if (!timeSlotsRes) {
            console.error("Time slots not found for host");
            return;
          }

          console.log("Fetched time slots:", timeSlotsRes);

          setTimeSlots(timeSlotsRes);
        }

        console.log("Fetched profile:", res);

        setProfile(res);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchTimeSlots = async () => {
      try {
        const res = await getTimeSlotsByHostId(id);
        setTimeSlots(res);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    fetchProfile();
    fetchTimeSlots();
  }, [id]);

  return (
    <section className="profile-page">
      <div className="profile-card">
        <a className="back-link" href="/" data-discover="true">
          ← Back to Homepage
        </a>
        <div className="profile-header">
          <h1>Profile</h1>
        </div>

        <div className="profile-top">
          <div className="profile-avatar">
            {profile?.image_url ? (
              <img
                className="avatar-img"
                src={`http://localhost:3000${profile.image_url}`}
                alt="Profile Avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {profile?.first_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-top-info">
            <h2> {`${profile?.first_name} ${profile?.last_name}`} </h2>
            {profile?.role && (
              <div>
                <p className="profile-role">
                  {profile.role === "host" ? "Host" : "Guest"}
                </p>
                <button
                  className="chat-launcher"
                  aria-label="Open chat"
                  onClick={() => setOpenChat(true)}
                >
                  Send a message
                </button>
                {openChat && (
                  <Chatbox
                    closeChat={() => setOpenChat(false)}
                    newReceiver={{
                      first_name: profile?.first_name,
                      last_name: profile?.last_name,
                      user_id: id,
                    }}
                  />
                )}
                <p>
                  {[profile?.city, profile?.country].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          {profile?.description && (
            <>
              <hr className="profile-divider" />
              <h3 className="profile-selection-title">About Me</h3>
              <p className="profile-description">{profile.description}</p>
            </>
          )}

          {profile?.host_activities && (
            <>
              <hr className="profile-divider" />
              <h3 className="profile-selection-title"> General Activities </h3>
              {profile.host_activities.map((activity) => (
                <p key={activity.id}>{activity.name}</p>
              ))}
            </>
          )}

          {timeSlots.length > 0 && (
            <>
              <hr className="profile-divider" />
              <h3 className="profile-selection-title">Available Time Slots</h3>
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
                        <p>{slot.start_time}</p>
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
                    activities={profile.host_activities || []}
                    canEdit={false}
                    onClose={() => setSelectedSlot(null)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
