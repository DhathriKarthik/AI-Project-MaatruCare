import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import './SwitchDoctorModal.css'; // Keeps styling aligned with app theme

const SwitchDoctorModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [informed, setInformed] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    if (!informed) {
      alert("Please select if you have informed the doctor.");
      return;
    }
    // Send payload back to parent
    onConfirm({ reason, informed });
    setReason("");
    setInformed("");
  };

  return createPortal(
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <h2>Switching Doctors?</h2>
        <p>We're sorry to see you switch. Please tell us why so we can improve.</p>

        <textarea
          className="modal-textarea"
          placeholder="E.g., Availability issues, prefer another specialist..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <select
          className="modal-select"
          value={informed}
          onChange={(e) => setInformed(e.target.value)}
        >
          <option value="">Have you informed the doctor?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn confirm" onClick={handleSubmit}>
            Confirm Change
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>,
    document.body
  );
};

export default SwitchDoctorModal;