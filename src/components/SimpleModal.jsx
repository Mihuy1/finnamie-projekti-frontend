export const SimpleModal = ({ title, text, onClose }) => {
  return (
    <div className="modal-overlay simple">
      <div className="modal-content simple">
        <div className="modal-header simple">
          <h3>{title}</h3>
        </div>
        <p>{text}</p>
        <button className="profile-btn profile-btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
