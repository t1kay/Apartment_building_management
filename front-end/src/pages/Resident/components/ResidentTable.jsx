import React from 'react';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ResidentTable = ({
  residentsByRoom,
  expandedRooms,
  search,
  onRoomToggle,
  onSelectResident,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <table className="resident-table">
      <thead>
        <tr>
          <th>Số phòng</th>
          <th>Họ tên</th>
          <th>Giới tính</th>
          <th>Quan hệ với chủ hộ</th>
          <th>Số điện thoại</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(residentsByRoom).map(([room, data]) => {
          const householdHead = data.householdHead;
          const isExpanded = expandedRooms[room];
          const searchLower = search.toLowerCase();
          
          // Kiểm tra xem phòng này có chứa kết quả tìm kiếm không
          const hasSearchMatch = search && (
            (householdHead?.FullName || '').toLowerCase().includes(searchLower) ||
            (householdHead?.PhoneNumber || '').toLowerCase().includes(searchLower) ||
            data.members.some(member => 
              (member.FullName || '').toLowerCase().includes(searchLower) ||
              (member.PhoneNumber || '').toLowerCase().includes(searchLower)
            )
          );
          
          // Nếu đang tìm kiếm và phòng này không có kết quả, bỏ qua
          if (search && !hasSearchMatch) {
            return null;
          }

          // Nếu đang tìm kiếm, hiển thị tất cả thành viên
          const shouldShowMembers = search || isExpanded;
          
          // Kiểm tra xem có cần hiển thị dòng chủ hộ không
          const shouldShowHouseholdHead = !search || (householdHead && (
            householdHead.FullName.toLowerCase().includes(searchLower) ||
            householdHead.PhoneNumber?.toLowerCase().includes(searchLower)
          ));
          
          return (
            <React.Fragment key={room}>
              {/* Hiển thị chủ hộ */}
              {shouldShowHouseholdHead && (
                <tr
                  className={`household-head-row ${hasSearchMatch ? 'search-match' : ''}`}
                  onClick={() => {
                    if (householdHead) {
                      onSelectResident(householdHead);
                    } else if (!search && data.members.length > 1) {
                      onRoomToggle(room);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    {!search && data.members.length > 1 ? (
                      <div className="room-cell" onClick={(e) => {
                        e.stopPropagation();
                        onRoomToggle(room);
                      }}>
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        <span>{room}</span>
                      </div>
                    ) : (
                      <div className="room-cell">
                        <span style={{ visibility: 'hidden' }}><FaChevronDown /></span>
                        <span>{room}</span>
                      </div>
                    )}
                  </td>
                  <td>{householdHead?.FullName || 'Chưa có chủ hộ'}</td>
                  <td>{householdHead?.Sex || '-'}</td>
                  <td>Chủ hộ</td>
                  <td>{householdHead?.PhoneNumber || '-'}</td>
                  <td className="resident-actions">
                    {householdHead && (
                      <>
                        <FaEdit
                          className="icon-action edit"
                          title="Sửa"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(householdHead);
                          }}
                        />
                        <FaTrash
                          className="icon-action delete"
                          title="Xóa"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(householdHead);
                          }}
                        />
                      </>
                    )}
                  </td>
                </tr>
              )}
              {/* Hiển thị các thành viên khác */}
              {shouldShowMembers && data.members
                .filter(member => member.ResidentID !== householdHead?.ResidentID)
                .map((member, idx) => {
                  // Kiểm tra xem thành viên này có khớp với từ khóa tìm kiếm không
                  const isMemberMatch = search && (
                    (member.FullName || '').toLowerCase().includes(searchLower) ||
                    (member.PhoneNumber || '').toLowerCase().includes(searchLower)
                  );
                  
                  // Nếu đang tìm kiếm và thành viên này không khớp, bỏ qua
                  if (search && !isMemberMatch) {
                    return null;
                  }
                  
                  return (
                    <tr
                      key={member.ResidentID || idx}
                      className={`${member.ResidencyStatus === "Đã chuyển đi" ? "resident-row-leaved" : ""} ${isMemberMatch ? 'search-match' : ''}`}
                      onClick={() => onSelectResident(member)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="room-cell">
                          <span style={{ visibility: 'hidden' }}><FaChevronDown /></span>
                          <span>{room}</span>
                        </div>
                      </td>
                      <td>{member.FullName}</td>
                      <td>{member.Sex}</td>
                      <td>{member.Relationship}</td>
                      <td>{member.PhoneNumber || '-'}</td>
                      <td className="resident-actions">
                        <FaEdit
                          className="icon-action edit"
                          title="Sửa"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClick(member);
                          }}
                        />
                        <FaTrash
                          className="icon-action delete"
                          title="Xóa"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(member);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ResidentTable;
