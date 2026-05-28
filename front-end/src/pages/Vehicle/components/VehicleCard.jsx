import React from 'react';

const VehicleCard = ({
  vehicle,
  expandedVehicleId,
  onVehicleClick,
  roomNumbers,
  img1,
  img2,
  onEditClick,
  onDeleteClick
}) => {
  const isExpanded = expandedVehicleId === vehicle.VehicleID;

  return (
    <div 
      className={`vehicle-box ${isExpanded ? 'expanded' : ''}`}
      onClick={() => onVehicleClick(vehicle.VehicleID)}
    >
      <div className="vehicle-basic-info">
        <img 
          src={vehicle.VehicleType === 'Xe máy' ? img1 : img2}
          alt={vehicle.VehicleType}
          className="vehicle-image"
        />
        <h3>Biển số: {vehicle.LicensePlate}</h3>
        <p className={`status ${vehicle.Status === 'Còn hạn đăng ký gửi' ? 'active' : 'inactive'}`}>
          {vehicle.Status}
        </p>
      </div>
      
      {isExpanded && (
        <div className="vehicle-details">
          <p><strong>Loại xe:</strong> {vehicle.VehicleType}</p>
          <p><strong>Nhãn hiệu:</strong> {vehicle.Brand}</p>
          <p><strong>Màu sắc:</strong> {vehicle.Color}</p>
          <p><strong>Ngày đăng ký:</strong> {vehicle.RegistrationDate}</p>
          <p><strong>Phòng:</strong> {roomNumbers[vehicle.HouseholdID] || 'Đang tải...'}</p>
          <div className="vehicle-actions">
            <button 
              className="edit-button"
              onClick={(e) => onEditClick(e, vehicle)}
            >
              Chỉnh sửa
            </button>
            <button 
              className="delete-button"
              onClick={(e) => onDeleteClick(e, vehicle)}
            >
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
