// @ts-nocheck
import { useState } from "react";
import { Link } from "react-router-dom";

const TABS = [
  { id: "users", label: "Users", icon: "👤" },
  { id: "suggestions", label: "Suggestions", icon: "💡" },
  { id: "activities", label: "Activities", icon: "🏃" },
  { id: "timeslots", label: "Timeslots", icon: "🕐" },
];

export const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [timeslots, setTimeslots] = useState([]);

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;

  return (
    <div className="admin">
      <div className="admin-sidebar">
        <Link to="/" className="admin-back-btn">← Back</Link>
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
          <SuggestionsSection suggestions={suggestions} setSuggestions={setSuggestions} />
        )}
        {activeTab === "activities" && (
          <ActivitiesSection activities={activities} setActivities={setActivities} />
        )}
        {activeTab === "timeslots" && (
          <TimeslotsSection timeslots={timeslots} setTimeslots={setTimeslots} />
        )}
      </div>
    </div>
  );
};



function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fi-FI", { day: "numeric", month: "numeric" });
  const time = d.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
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

function ConfirmModal({ open, onClose, onConfirm, title, desc }) {
  return (
    <Modal open={open} onClose={onClose} title={title} desc={desc}>
      <div className="modal-actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}

/* ── Users section */

function UsersSection({ users, setUsers }) {
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

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
                    <div className="avatar">{initials(u.name)}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="td-muted">{u.email}</td>
                <td>
                  <span className={`pill ${u.role === "Admin" ? "pill-admin" : "pill-user"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => setDeleteTarget(u)}>
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
        onConfirm={() => {
          setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc={`Are you sure you want to delete user ${deleteTarget?.name}?`}
      />
    </>
  );
}

// Suggestions section

const STATUS_LABEL = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" };

function SuggestionsSection({ suggestions, setSuggestions }) {
  const decide = (id, status) => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr key={s.id}>
                <td className="td-bold">{s.name}</td>
                <td className="td-muted">{s.user}</td>
                <td>
                  <span className={`pill pill-${s.status}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
                <td>
                  {s.status === "pending" ? (
                    <div className="btn-row">
                      <button className="btn btn-success" onClick={() => decide(s.id, "accepted")}>
                        Accept
                      </button>
                      <button className="btn btn-danger" onClick={() => decide(s.id, "rejected")}>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="td-dash">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// Activities section

function ActivitiesSection({ activities, setActivities }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", cat: "", dur: "" });

  const handleSave = () => {
    if (!form.name.trim()) return;
    setActivities((prev) => [
      ...prev,
      { id: Date.now(), name: form.name, cat: form.cat || "—", dur: (form.dur || 60) + " h" },
    ]);
    setForm({ name: "", cat: "", dur: "" });
    setShowAdd(false);
  };

  return (
    <>
      <div className="admin-page-title">Activities</div>
      <div className="admin-page-sub">Manage current activities</div>

      <div className="admin-top-bar">
        <span />
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td className="td-muted">{a.cat}</td>
                <td className="td-muted">{a.dur}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => setDeleteTarget(a)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add activity">
        {[
          { key: "name", label: "Name", placeholder: "" },
          { key: "cat", label: "Category", placeholder: "" },
          { key: "dur", label: "Duration (h)", placeholder: "", type: "number" },
        ].map(({ key, label, placeholder, type }) => (
          <div className="form-row" key={key}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              type={type || "text"}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc={`Are you sure you want to delete activity ${deleteTarget?.name}?`}
      />
    </>
  );
}

// Timeslots section

function TimeslotsSection({ timeslots, setTimeslots }) {
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState({ time: "", instructor: "" });

  const openEdit = (ts) => {
    setEditTarget(ts);
    setEditForm({ time: ts.time, instructor: ts.instructor });
  };

  const handleSaveEdit = () => {
    setTimeslots((prev) =>
      prev.map((t) => (t.id === editTarget.id ? { ...t, ...editForm } : t))
    );
    setEditTarget(null);
  };

  return (
    <>
      <div className="admin-page-title">Schedules</div>
      <div className="admin-page-sub">All timeslots</div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Activity</th>
              <th>Instructor</th>
              <th>Bookings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeslots.map((t) => {
              const { date, time } = formatTime(t.time);
              const full = t.booked >= t.max;
              return (
                <tr key={t.id}>
                  <td>{date} <strong>{time}</strong></td>
                  <td>{t.act}</td>
                  <td className="td-muted">{t.instructor}</td>
                  <td>
                    <span className={`pill ${full ? "pill-full" : "pill-open"}`}>
                      {t.booked}/{t.max}
                    </span>
                  </td>
                  <td>
                    <div className="btn-row">
                      <button className="btn" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => setDeleteTarget(t)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit timeslot">
        <div className="form-row">
          <label className="form-label">Time</label>
          <input
            className="form-input"
            type="datetime-local"
            value={editForm.time}
            onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Instructor</label>
          <input
            className="form-input"
            value={editForm.instructor}
            onChange={(e) => setEditForm((f) => ({ ...f, instructor: e.target.value }))}
          />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setTimeslots((prev) => prev.filter((t) => t.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        title="Confirm delete"
        desc="Are you sure you want to delete this timeslot?"
      />
    </>
  );
}
