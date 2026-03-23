export const ConfirmModal = ({
  text,
  title,
  confirmText,
  declineText,
  onConfirm,
  onDecline,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content confirm">
        <div className="modal-confirm-title">
          <h3> {title} </h3>
        </div>
        <p>{text}</p>
        <div className="modal-confirm-bottom">
          <button onClick={onDecline}>{declineText}</button>
          <button onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
