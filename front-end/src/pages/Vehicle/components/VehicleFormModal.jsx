import React from 'react';

const VehicleFormModal = ({
  formMode,
  formData,
  rooms,
  onInputChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <h2>{formMode === 'edit' ? 'Chỉnh sửa thông tin xe' : 'Thêm xe mới'}</h2>
        <form onSubmit={onSubmit}>
          {formMode === 'add' && (
            <div className="form-group">
              <label>Số phòng:</label>
              <select
                name="RoomNumber"
                value={formData.RoomNumber || ''}
                onChange={onInputChange}
                required
              >
                <option value="">Chọn số phòng</option>
                {rooms.map(room => (
                  <option key={room.householdId} value={room.roomNumber}>
                    Phòng {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Biển số:</label>
            <input
              type="text"
              name="LicensePlate"
              value={formData.LicensePlate || ''}
              onChange={onInputChange}
              required
              placeholder="Nhập biển số xe"
            />
          </div>
          <div className="form-group">
            <label>Loại xe:</label>
            <select
              name="VehicleType"
              value={formData.VehicleType || 'Xe máy'}
              onChange={onInputChange}
              required
            >
              <option value="Xe máy">Xe máy</option>
              <option value="Ô tô">Ô tô</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nhãn hiệu:</label>
            <input
              type="text"
              name="Brand"
              value={formData.Brand || ''}
              onChange={onInputChange}
              required
              placeholder="Nhập nhãn hiệu xe"
            />
          </div>
          <div className="form-group">
            <label>Màu sắc:</label>
            <input
              type="text"
              name="Color"
              value={formData.Color || ''}
              onChange={onInputChange}
              required
              placeholder="Nhập màu sắc xe"
            />
          </div>
          <div className="form-group">
            <label>Ngày đăng ký:</label>
            <input
              type="date"
              name="RegistrationDate"
              value={formData.RegistrationDate || ''}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Trạng thái:</label>
            <select
              name="Status"
              value={formData.Status || 'Còn hạn đăng ký gửi'}
              onChange={onInputChange}
              required
            >
              <option value="Còn hạn đăng ký gửi">Còn hạn đăng ký gửi</option>
              <option value="Hết hạn đăng ký gửi">Hết hạn đăng ký gửi</option>
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {formMode === 'edit' ? 'Xác nhận' : 'Thêm xe'}
            </button>
            <button type="button" className="cancel-button" onClick={onCancel}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
