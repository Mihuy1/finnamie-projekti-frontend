// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  acceptActivitySuggestion,
  createActivity,
  deleteActivity,
  deleteExperienceById,
  deleteExperienceImageByIdAndUrl,
  deleteUser,
  getActivities,
  getAllActivitySuggestions,
  getAllExperiencesWithHost,
  getAllReservations,
  getAllUsers,
  getPriceData,
  markReservationsPaid,
  rejectActivitySuggestion,
  setPriceData,
  updateActivityNameById,
  updateExperience,
  uploadExperienceImage,
} from "../api/apiClient";
import {
  formatLocalDateRange,
  formatLocalTimeRange,
} from "../utils/date-utils";
import toast from "react-hot-toast";
import { EditTimeSlot } from "../components/EditTimeSlot";

const API_BASE_URL = "http://localhost:3000";

const TABS = [
  { id: "users", label: "Users", icon: "👤" },
  { id: "activities", label: "Activities", icon: "🏃" },
  { id: "suggestions", label: "Suggestions", icon: "💡" },
  { id: "experiences", label: "Experiences", icon: "🕐" },
  { id: "payment", label: "Payments", icon: "💲" },
];

const sortByName = (items = []) =>
  [...items].sort((a, b) =>
    (a?.name || "").localeCompare(b?.name || "", "en", {
      sensitivity: "base",
    }),
  );

export const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [prices, setPrices] = useState([]);

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  useEffect(() => {
    const fetchData = async () => {
      const usersRes = await getAllUsers();
      const activitiesRes = await getActivities();
      const activitiesSuggestionsRes = await getAllActivitySuggestions();
      const experiences = await getAllExperiencesWithHost();
      const prices = await getPriceData();

      setUsers(usersRes);
      setActivities(sortByName(activitiesRes));
      setSuggestions(activitiesSuggestionsRes);
      setExperiences(Array.isArray(experiences) ? experiences : []);
      setPrices(prices);
    };

    fetchData();
  }, []);

  return (
    <div className="admin">
      <div className="admin-sidebar">
        <Link to="/" className="admin-back-btn">
          ← Back
        </Link>
        <div className="admin-sidebar-title">Admin</div>
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`admin-nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.id === "suggestions" && pendingCount > 0 && (
              <span className="admin-nav-badge">{pendingCount}</span>
            )}
          </div>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "users" && (
          <UsersSection users={users} setUsers={setUsers} />
        )}
        {activeTab === "suggestions" && (
          <SuggestionsSection
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setActivities={setActivities}
          />
        )}
        {activeTab === "activities" && (
          <ActivitiesSection
            activities={activities}
            setActivities={setActivities}
          />
        )}
        {activeTab === "experiences" && (
          <ExperiencesSection
            experiences={experiences}
            setExperiences={setExperiences}
          />
        )}
        {activeTab === "payment" && <PaymentSection prices={prices} />}
      </div>
    </div>
  );
};

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Modal({ open, onClose, title, desc, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {desc && <div className="modal-desc">{desc}</div>}
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  desc,
  confirmButtonText = "Delete",
  confirmButtonColor = "danger",
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} desc={desc}>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
        <button className={`btn btn-${confirmButtonColor}`} onClick={onConfirm}>
          {confirmButtonText}
        </button>
      </div>
    </Modal>
  );
}

/* ── Users section */

function UsersSection({ users, setUsers }) {
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = users.filter((u) => {
    const searchText =
      `${u.first_name || ""} ${u.last_name || ""} ${u.email || ""}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  const removeUser = async (id) => {
    await toast.promise(deleteUser(id), {
      loading: "Deleting user...",
      success: (res) => res?.message || "User deleted successfully",
      error: (error) => {
        if (error.status === 404) return "User not found";
        return error?.message || "Failed to delete user";
      },
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <>
      <div className="admin-page-title">Users</div>
      <div className="admin-page-sub">All registered users</div>

      <div className="admin-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            className="search-input"
            placeholder="Search user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="user-count">{filtered.length} users</span>
        </div>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    {u.image_url === null ? (
                      <>
                        <div className="avatar">{initials(u.first_name)}</div>
                      </>
                    ) : (
                      <div className="avatar">
                        <img
                          className="avatar-img"
                          src={`http://localhost:3000${u.image_url}`}
                          alt="Profile avatar"
                          // onClick={handleImageClick}
                        />
                      </div>
                    )}
                    <span>
                      {u.first_name} {u.last_name}{" "}
                    </span>
                  </div>
                </td>
                <td className="td-muted">{u.email}</td>
                <td>
                  <span
                    className={`pill ${u.role === "Admin" ? "pill-admin" : "pill-user"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => setDeleteTarget(u)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await removeUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc={`Are you sure you want to delete user ${deleteTarget?.name}?`}
        confirmButtonText="Delete"
      />
    </>
  );
}

// Suggestions section

function SuggestionsSection({ suggestions, setSuggestions, setActivities }) {
  const [rejectedSuggestion, setRejectedSuggestion] = useState();
  const [acceptedSuggestion, setAcceptedSuggestion] = useState();

  const acceptSuggestion = async (id, name) => {
    await toast.promise(acceptActivitySuggestion(id, name), {
      loading: `Accepting ${name}...`,
      success: (res) => res?.message || "Activity Suggestion accepted",
      error: (error) => {
        if (error?.status === 409) return "Activity already exists";
        if (error?.status === 404) return "Activity suggestion not found";
        return error?.message || "Failed to accept activity";
      },
    });

    const updatedActivities = await getActivities();
    if (Array.isArray(updatedActivities)) {
      setActivities(sortByName(updatedActivities));
    }

    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const rejectSuggestion = async (id, name) => {
    await toast.promise(rejectActivitySuggestion(id), {
      loading: `Rejecting ${name}...`,
      success: (res) => res?.message || "Activity Suggestion rejected",
      error: (error) => {
        if (error?.status === 404) return "Activity Suggestion not found";
        return error?.message || "Failed to reject Activity Suggestion";
      },
    });

    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      <div className="admin-page-title">Activity suggestions</div>
      <div className="admin-page-sub">Suggestions submitted by users</div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Suggestion</th>
              <th>Submitted by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.id}>
                <td className="td-bold">{s.name}</td>
                <td className="td-muted">
                  {s.first_name} {s.last_name}
                </td>

                <td>
                  <div className="btn-row">
                    <button
                      className="btn btn-success"
                      onClick={() => setAcceptedSuggestion(s)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setRejectedSuggestion(s)}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!rejectedSuggestion}
        onClose={() => setRejectedSuggestion(null)}
        onConfirm={async () => {
          await rejectSuggestion(
            rejectedSuggestion.id,
            rejectedSuggestion.name,
          );
          setRejectedSuggestion(null);
        }}
        title="Confirm Reject"
        desc={`Are you sure you want to reject suggestion ${rejectedSuggestion?.name}?`}
        confirmButtonText="Reject"
      />
      <ConfirmModal
        open={!!acceptedSuggestion}
        onClose={() => setAcceptedSuggestion(null)}
        onConfirm={async () => {
          await acceptSuggestion(
            acceptedSuggestion.id,
            acceptedSuggestion.name,
          );
          setAcceptedSuggestion(null);
        }}
        title="Confirm Accept"
        desc={`Are you sure you want to accept suggestion ${acceptedSuggestion?.name}?`}
        confirmButtonText="Accept"
        confirmButtonColor="success"
      />
    </>
  );
}

// Activities section

function ActivitiesSection({ activities, setActivities }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "" });

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const result = await toast.promise(createActivity(form.name), {
      loading: "Creating activity...",
      success: (res) => res.message || "Activity created successfully!",
      error: (err) => {
        if (err?.status === 409)
          return err.message || "Something went wrong during activity creation";

        return err?.message || "Something went wrong while creating activity";
      },
    });

    setActivities((prev) =>
      sortByName([...prev, { id: result.id, name: form.name }]),
    );

    setForm({ name: "" });
    setShowAdd(false);
  };

  const removeActivity = async (id) => {
    await toast.promise(deleteActivity(id), {
      loading: "Deleting activity...",
      success: (res) => res?.message || "Activity deleted successfully",
      error: (error) => {
        if (error?.status === 404) return error.message || "Activity not found";
        if (error?.status === 409)
          return error.message || "Activity cannot be removed.";
        if (error?.status === 500) return error.message || "500 error";
        return error?.message || "Error deleting activity";
      },
    });

    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const editActivity = async () => {
    await toast.promise(
      updateActivityNameById(editTarget.id, editTarget.name || ""),
      {
        loading: "Updating activity name...",
        success: (res) => res?.message || "Activity name updated!",
        error: (err) => {
          return err?.message || "Failed to update activity";
        },
      },
    );

    setActivities((prev) =>
      prev.map((a) => (a.id === editTarget.id ? editTarget : a)),
    );

    setEditTarget(null);
    setIsEditing(false);
  };

  return (
    <>
      <div className="admin-page-title">Activities</div>
      <div className="admin-page-sub">Manage current activities</div>

      <div className="admin-top-bar">
        <span />
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add
        </button>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td>
                  <div className="btn-row">
                    <button
                      className="btn"
                      onClick={() => {
                        setEditTarget(a);
                        setIsEditing(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setDeleteTarget(a)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add activity"
      >
        {[{ key: "name", label: "Name", placeholder: "" }].map(
          ({ key, label, placeholder, type }) => (
            <div className="form-row" key={key}>
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type={type || "text"}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            </div>
          ),
        )}
        <div className="modal-actions">
          <button className="btn" onClick={() => setShowAdd(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </Modal>

      <Modal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit activity"
      >
        <div className="form-row">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            type={"text"}
            value={editTarget?.name}
            onChange={(e) =>
              setEditTarget((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={editActivity}>
            Edit
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await removeActivity(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc={`Are you sure you want to delete activity ${deleteTarget?.name}?`}
      />
    </>
  );
}

// Experiences sections

function ExperiencesSection({ experiences, setExperiences }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const removeExperience = async (id) => {
    await toast.promise(
      (async () => {
        const res = await deleteExperienceById(id);
        if (res?.error || res?.success === false) {
          throw new Error(
            res?.message || res?.error || "Failed to delete experience",
          );
        }
        return res;
      })(),
      {
        loading: "Deleting experience...",
        success: (res) => res?.message || "Experience deleted successfully",
        error: (error) => error?.message || "Failed to delete experience",
      },
    );

    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateExperience = async (
    updatedData,
    images,
    toRemoveImages,
  ) => {
    const result = await toast.promise(
      updateExperience(selectedExperience.id, updatedData, images),
      {
        loading: "Updating experience...",
        success: (res) => res?.message || "Experience updated successfully",
        error: (err) => {
          return err?.message || "Failed to update experience";
        },
      },
    );

    console.log(result);

    let updatedResult = result.experience;

    if (toRemoveImages.length > 0) {
      for (const img of toRemoveImages) {
        img.url = img.url.replace(API_BASE_URL, "");
        const res = await deleteExperienceImageByIdAndUrl(
          selectedExperience.id,
          img.url,

          (updatedResult = {
            ...updatedResult,
            images: (updatedResult.images || []).filter(
              (i) => i.url !== img.url,
            ),
          }),
        );
        if (!res) return;
      }
    }

    const newFiles = (images || []).filter((f) => f instanceof File);

    if (newFiles.length > 0) {
      const upload = await uploadExperienceImage(
        selectedExperience.id,
        newFiles,
      );
      if (!upload || !upload.files) return;

      const newImageObjects = upload.files.map((file) => ({
        url: file.url,
      }));

      updatedResult = {
        ...updatedResult,
        images: [...(updatedResult.images || []), ...newImageObjects],
      };
    }

    setIsEditing(false);
    setSelectedExperience(null);
    setExperiences((prev) =>
      prev.map((e) => (e.id === updatedResult.id ? updatedResult : e)),
    );

    console.log("updatedResult:", updatedResult);
  };

  if (isEditing && selectedExperience) {
    return (
      <EditTimeSlot
        slot={selectedExperience}
        images={selectedExperience.images}
        onCancel={() => {
          setIsEditing(false);
          setSelectedExperience(null);
        }}
        onSave={handleUpdateExperience}
      />
    );
  }

  return (
    <>
      <div className="admin-page-title">Experiences</div>
      <div className="admin-page-sub">All published experiences</div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Host</th>
              <th>Activity</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((e) => {
              const hostName =
                [e.first_name, e.last_name].filter(Boolean).join(" ") ||
                e.host_id ||
                "-";
              const startDate = e.rule?.start_date;
              const endDate = e.rule?.end_date;
              const startTime = e.rule?.start_time;
              const endTime = e.rule?.end_time;

              const dateRange = formatLocalDateRange(startDate, endDate);
              const timeRange = formatLocalTimeRange(
                startDate,
                startTime,
                endDate,
                endTime,
              );

              const activities = e.activities.map((a) => a.name);

              return (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.title || "Untitled"}</td>
                  <td className="td-muted">{dateRange}</td>
                  <td className="td-muted">{timeRange}</td>
                  <td className="td-muted">
                    {e.type || e.experience_length || "-"}
                  </td>
                  <td className="td-muted">{hostName}</td>
                  <td className="td-muted">{activities.join(", ")}</td>

                  <td className="td-muted">{e.city || "-"}</td>
                  <td>
                    <div className="btn-row">
                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedExperience(e);
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => setDeleteTarget(e)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await removeExperience(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc={`Are you sure you want to delete experience ${deleteTarget?.title || ""}?`}
      />
    </>
  );
}

const PaymentSection = ({ prices }) => {
  const [data, setData] = useState(prices);
  const [reservations, setReservations] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllReservations();
      console.log(data);
      setReservations(data);
    };
    fetchData();
  }, []);

  const handleChange = (index, newPriceId) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      price_id: newPriceId,
    };
    setData(updated);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleMarkPaid = async () => {
    await toast.promise(markReservationsPaid(selected), {
      loading: "Updating payments...",
      success: "Marked as paid!",
      error: "Failed to update payments",
    });
    // UPDATE UI
    setReservations((prev) =>
      prev.map((res) =>
        selected.includes(res.id) ? { ...res, payment_received: 1 } : res,
      ),
    );

    setSelected([]);
  };

  const handleUpdateAll = async () => {
    await toast.promise(setPriceData(data), {
      loading: "Updating prices...",
      success: "Prices updated successfully!",
      error: (error) => error.message || "Failed to update profile",
    });
  };

  const styles = {
    input: {
      width: "100%",
      padding: "4px",
      borderRadius: "4px",
      borderWidth: "1px",
    },
    button: {
      margin: "12px",
      padding: "8px 16px",
      cursor: "pointer",
    },
  };

  return (
    <div>
      <div
        className="table-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Price ID</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.type}>
                <td className="td-muted">{item.type}</td>
                <td className="td-muted">
                  <input
                    type="text"
                    value={item.price_id}
                    onChange={(e) => handleChange(index, e.target.value)}
                    style={styles.input}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button style={styles.button} onClick={handleUpdateAll}>
          Update
        </button>
      </div>
      <div
        className="table-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <table className="admin-table" style={{ marginTop: "24px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td>
                  {res.first_name} {res.last_name}
                </td>
                <td>{res.res_date}</td>
                <td>{res.booking_status}</td>
                <td>{res.payment_received ? "Paid" : "Unpaid"}</td>
                <td>
                  {!res.payment_received && (
                    <input
                      type="checkbox"
                      checked={selected.includes(res.id)}
                      onChange={() => handleSelect(res.id)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          style={styles.button}
          onClick={handleMarkPaid}
          disabled={selected.length === 0}
        >
          Mark selected as paid
        </button>
      </div>
    </div>
  );
};
