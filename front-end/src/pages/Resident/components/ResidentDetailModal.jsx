import React from 'react';

const ResidentDetailModal = ({ selectedResident, roomNumbers, onClose }) => {
  if (!selectedResident) return null;

  return (
    <div className="resident-detail-overlay" onClick={onClose}>
      <div className="resident-detail-modal" onClick={e => e.stopPropagation()}>
        <h3>Thông tin chi tiết nhân khẩu</h3>
        <div className="resident-detail-content">
          <div className="detail-row">
            <p><strong>Họ tên:</strong> {selectedResident.FullName}</p>
            <p><strong>Giới tính:</strong> {selectedResident.Sex}</p>
          </div>
          <div className="detail-row">
            <p><strong>Ngày sinh:</strong> {selectedResident.DateOfBirth}</p>
            <p><strong>Quan hệ với chủ hộ:</strong> {selectedResident.Relationship}</p>
          </div>
          <div className="detail-row">
            <p><strong>Số điện thoại:</strong> {selectedResident.PhoneNumber || '-'}</p>
            <p><strong>Trình độ học vấn:</strong> {selectedResident.EducationLevel || '-'}</p>
          </div>
          <div className="detail-row">
            <p><strong>Nghề nghiệp:</strong> {selectedResident.Occupation || '-'}</p>
            <p><strong>Phòng:</strong> {roomNumbers[String(selectedResident.HouseholdID)] || '---'}</p>
          </div>
          <div className="detail-row">
            <p><strong>Tình trạng cư trú:</strong> {selectedResident.ResidencyStatus}</p>
            <p><strong>Ngày đăng ký:</strong> {selectedResident.RegistrationDate}</p>
          </div>
        </div>
        <button className="close-detail-btn" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default ResidentDetailModal;
