/* eslint-disable no-unused-vars */
import React from 'react';
import Header from '../components/Header';

import Sidebar from '../components/Sidebar';
import '../styles/Resident.css';
import SearchBar from '../components/SearchBar';
import AddButton from '../components/AddButton';
import AddResident from '../components/AddResident';
import axiosInstance from '../utils/axiosInstance';
import Toast from '../components/Toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { validatePhoneNumber } from '../utils/helper';
import ResidentTable from './Resident/components/ResidentTable';
import ResidentDetailModal from './Resident/components/ResidentDetailModal';

const Resident = () => {
  const [open, setOpen] = React.useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  React.useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  const [showAddResident, setShowAddResident] = React.useState(false);
  const [residents, setResidents] = React.useState([]);
  const [editResident, setEditResident] = React.useState(null);
  const [selectedResident, setSelectedResident] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [households, setHouseholds] = React.useState([]);
  const [roomNumbers, setRoomNumbers] = React.useState({});
  const [toast, setToast] = React.useState({ message: '', type: 'info' });
  const [deletingResident, setDeletingResident] = React.useState(null);
  const [expandedRooms, setExpandedRooms] = React.useState({});

  React.useEffect(() => {
    fetchResidents();
  }, []);

  React.useEffect(() => {
    const fetchHouseholds = async () => {
      const res = await axiosInstance.get('/households/get-all-households');
      setHouseholds(res.data.households || res.data);
    };
    fetchHouseholds();
  }, []);

  React.useEffect(() => {
    const map = {};
    households.forEach(h => {
      map[String(h.HouseholdID)] = h.RoomNumber;
    });
    setRoomNumbers(map);
  }, [households]);

  const getResidentCount = (householdId) => {
    return residents.filter(r => r.HouseholdID === householdId).length;
  };

  const toggleRoom = (room) => {
    setExpandedRooms(prev => ({
      ...prev,
      [room]: !prev[room]
    }));
  };

  const filteredResidents = React.useMemo(() => {
    return residents.filter(item => {
      const room = roomNumbers[String(item.HouseholdID)] || '';
      const searchLower = search.toLowerCase();

      // Tách full name thành các phần, kiểm tra từng phần
      const nameParts = (item.FullName || '').toLowerCase().split(' ').filter(Boolean);
      const nameMatch = nameParts.some(part => part.includes(searchLower));

      return (
        nameMatch ||
        (item.PhoneNumber || '').toLowerCase().includes(searchLower) ||
        room.toLowerCase().includes(searchLower)
      );
    });
  }, [residents, roomNumbers, search]);

  const sortedResidents = React.useMemo(() => {
    return [...filteredResidents].sort((a, b) => {
      const roomA = roomNumbers[String(a.HouseholdID)] || '';
      const roomB = roomNumbers[String(b.HouseholdID)] || '';
      const numA = parseInt(roomA, 10);
      const numB = parseInt(roomB, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return roomA.localeCompare(roomB);
    });
  }, [filteredResidents, roomNumbers]);

  // Nhóm nhân khẩu theo phòng và tìm chủ hộ
  const residentsByRoom = React.useMemo(() => {
    const result = {};
    sortedResidents.forEach(resident => {
      const room = roomNumbers[String(resident.HouseholdID)] || '---';
      if (!result[room]) {
        result[room] = {
          householdHead: null,
          members: []
        };
      }
      
      if (resident.Relationship === 'Chủ hộ') {
        result[room].householdHead = resident;
      }
      result[room].members.push(resident);
    });
    return result;
  }, [sortedResidents, roomNumbers]);

  // Tự động mở rộng phòng khi tìm kiếm
  React.useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();
      const newExpandedRooms = {};
      
      Object.entries(residentsByRoom).forEach(([room, data]) => {
        // Kiểm tra nếu chủ hộ hoặc bất kỳ thành viên nào khớp với từ khóa tìm kiếm
        const householdHead = data.householdHead;
        const members = data.members;
        
        const isMatch = 
          (householdHead?.FullName || '').toLowerCase().includes(searchLower) ||
          (householdHead?.PhoneNumber || '').toLowerCase().includes(searchLower) ||
          members.some(member => 
            (member.FullName || '').toLowerCase().includes(searchLower) ||
            (member.PhoneNumber || '').toLowerCase().includes(searchLower)
          );
        
        if (isMatch) {
          newExpandedRooms[room] = true;
        }
      });
      
      setExpandedRooms(newExpandedRooms);
    } else {
      setExpandedRooms({});
    }
  }, [search, residentsByRoom]);

  const fetchResidents = async () => {
    const response = await axiosInstance.get('/residents/get-all-residents');
    const data = response.data.residents || response.data;
    setResidents(data);
  };

  const handleAddResident = async (data) => {
    const currentCount = getResidentCount(data.HouseholdID);
    const household = households.find(h => h.HouseholdID === data.HouseholdID);

    // Validate số điện thoại
    if (!validatePhoneNumber(data.PhoneNumber || '')) {
      setToast({ message: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!", type: "error" });
      return;
    }

    if (household && currentCount >= household.Members) {
      setToast({ message: "Số nhân khẩu đã đạt tối đa cho phòng này!", type: "error" });
      return;
    }

    try {
      const response = await axiosInstance.post('/residents/create-resident', data);
      await fetchResidents();
      setShowAddResident(false);
      setToast({ message: "Thêm nhân khẩu thành công!", type: "success" });
    } catch (error) {
      setToast({ message: "Thêm nhân khẩu thất bại!", type: "error" });
    }
  };

  const handleEditResident = async (data) => {
    // Validate số điện thoại
    if (!validatePhoneNumber(data.PhoneNumber || '')) {
      setToast({ message: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!", type: "error" });
      return;
    }

    try {
      const response = await axiosInstance.put(`/residents/update-resident/${editResident.ResidentID}`, data);
      const updatedResident = response.data.newResident || response.data;
      setResidents((prev) =>
        prev.map((h) => (h.ResidentID === updatedResident.ResidentID ? updatedResident : h))
      );
      await fetchResidents();
      setEditResident(null);
      setToast({ message: "Cập nhật nhân khẩu thành công!", type: "success" });
    } catch (error) {
      setToast({ message: "Cập nhật nhân khẩu thất bại!", type: "error" });
    }
  };

  const handleDeleteResident = async (id) => {
    try {
      await axiosInstance.delete(`/residents/delete-resident/${id}`);
      setResidents((prev) => prev.filter((r) => r.ResidentID !== id));
      await fetchResidents();
      setToast({ message: "Xóa nhân khẩu thành công!", type: "success" });
    } catch (error) {
      setToast({ message: "Xóa nhân khẩu thất bại!", type: "error" });
    }
  };

  const handleEditClick = (resident) => {
    setEditResident(resident);
  };

  const handleDeleteClick = (resident) => {
    setDeletingResident(resident);
  };

  const handleSelectResident = (resident) => {
    setSelectedResident(resident);
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
      <div className="page-container">
        <Header />
        <div className="page-body">
          <Sidebar open={open} setOpen={setOpen} />
          <div className={`page-content ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="resident-search">
              <div className="resident-title"><h1>Danh sách nhân khẩu:</h1></div>
              <SearchBar
                placeholder="Tìm kiếm nhân khẩu"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(searchInput);
                  }
                }}
                onSearch={() => setSearch(searchInput)}
              />
            </div>
            <div className="resident-list">
              <ResidentTable
                residentsByRoom={residentsByRoom}
                expandedRooms={expandedRooms}
                search={search}
                onRoomToggle={toggleRoom}
                onSelectResident={handleSelectResident}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            </div>

            <ResidentDetailModal
              selectedResident={selectedResident}
              roomNumbers={roomNumbers}
              onClose={() => setSelectedResident(null)}
            />

            <AddButton onClick={() => setShowAddResident(true)} />
            <AddResident
              open={showAddResident || !!editResident}
              onClose={() => {
                setShowAddResident(false);
                setEditResident(null);
              }}
              onSubmit={(data) => {
                if (editResident) {
                  handleEditResident(data);
                } else {
                  handleAddResident(data);
                }
              }}
              initialData={editResident}
            />

            <DeleteConfirmModal
              open={!!deletingResident}
              title="Xác nhận xóa"
              message={
                deletingResident
                  ? <>Bạn có chắc chắn muốn xóa nhân khẩu <strong>{deletingResident.FullName}</strong>?</>
                  : ""
              }
              onConfirm={async () => {
                await handleDeleteResident(deletingResident.ResidentID);
                setDeletingResident(null);
              }}
              onCancel={() => setDeletingResident(null)}
            />
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Resident;
