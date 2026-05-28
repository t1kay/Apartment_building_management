import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import Header from '../components/Header';

import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axiosInstance from '../utils/axiosInstance';

let MAX_HOUSEHOLD = 100;
let MAX_SINGLE_ROOMS = 50;
let MAX_DOUBLE_ROOMS = 50;

const COLORS = ['#27ae60', '#e74c3c', '#ff9900', '#1972bb', '#8e44ad']; // 5 màu cho 5 nhóm tuổi

// Hàm tính tuổi từ ngày sinh
const getAge = (dob) => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Hàm kiểm tra trong vòng 14 ngày
const isWithin14Days = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today - date);
  return diffTime / (1000 * 60 * 60 * 24) <= 14;
};

// Hàm lấy tên tháng từ số tháng
const getMonthName = (month) => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months[month];
};

// Hàm đánh giá mức độ hoàn thành
const getCompletionLevel = (percentage) => {
  if (percentage >= 100) return 'Xuất sắc';
  if (percentage >= 80) return 'Tốt';
  if (percentage >= 50) return 'Khá';
  return 'Kém';
};

const Home = () => {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  const [households, setHouseholds] = useState([]);
  const [residents, setResidents] = useState([]);
  const [feeCollections, setFeeCollections] = useState([]);
  const [feeDetails, setFeeDetails] = useState([]);
  const [currentMonthStats, setCurrentMonthStats] = useState({
    totalFeeTypes: 0,
    totalAmount: 0,
    completionRate: 0,
    completionLevel: '',
    paymentPercentage: 0,
    totalFeeDetails: 0,
    paidFeeDetails: 0
  });

  useEffect(() => {
    // Lấy dữ liệu hộ gia đình và cư dân
    axiosInstance.get('/households/get-all-households').then(res => {
      setHouseholds(res.data.households || res.data);
    });
    axiosInstance.get('/residents/get-all-residents').then(res => {
      setResidents(res.data.residents || res.data);
    });

    // Lấy dữ liệu thu phí
    axiosInstance.get('/fee-collection/get-all-collection').then(res => {
      setFeeCollections(res.data.feeCollections || res.data);
    });
    axiosInstance.get('/fee-detail/get-all-fee-detail').then(res => {
      // In ra cấu trúc dữ liệu của một FeeDetail để kiểm tra
      console.log('Cấu trúc dữ liệu FeeDetail:', res.data.feeDetails?.[0]);
      setFeeDetails(res.data.feeDetails);
    });
  }, []);

  // Tính toán thống kê phí theo tháng hiện tại
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Lọc các khoản thu phí trong tháng hiện tại
    const currentMonthCollections = feeCollections.filter(collection => {
      const startDate = new Date(collection.StartDate);
      const endDate = new Date(collection.EndDate);
      
      // Kiểm tra nếu ngày bắt đầu hoặc kết thúc nằm trong tháng hiện tại
      return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
             (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear);
    });

    // In ra danh sách CollectionID của tháng hiện tại
    console.log('Danh sách CollectionID trong tháng hiện tại:', 
      currentMonthCollections.map(c => ({
        CollectionID: c.CollectionID,
        FeeType: c.FeeType,
        StartDate: c.StartDate,
        EndDate: c.EndDate
      }))
    );

    // Lọc và in ra tất cả FeeDetail có CollectionID thỏa mãn
    const currentMonthFeeDetails = feeDetails.filter(detail => 
      currentMonthCollections.some(collection => collection.CollectionID === detail.CollectionID)
    );
    console.log('Tất cả FeeDetail có CollectionID thỏa mãn:', 
      currentMonthFeeDetails.map(detail => ({
        CollectionID: detail.CollectionID,
        Amount: detail.Amount,
        Status: detail.PaymentStatus,
        PaymentDate: detail.PaymentDate
      }))
    );

    // Tính thống kê thanh toán
    const totalFeeDetails = currentMonthFeeDetails.filter(detail =>
      Number(detail.Amount) !== 0
    ).length;
    const paidFeeDetails = currentMonthFeeDetails.filter(detail => 
      detail.PaymentStatus === 'Đã đóng'
    ).length;
    
    console.log('Tổng số FeeDetail trong tháng hiện tại:', totalFeeDetails);

    const paymentPercentage = totalFeeDetails > 0 ? (paidFeeDetails / totalFeeDetails) * 100 : 0;

    // Đếm số loại phí đã thu
    const uniqueFeeTypes = new Set(currentMonthCollections.map(c => c.FeeType)).size;

    // Tính tổng số tiền đã thu từ các FeeDetail có Status = 'Đã đóng'
    const totalAmount = feeDetails.reduce((sum, detail) => {
      // Kiểm tra nếu detail thuộc một trong các collection của tháng hiện tại
      const isInCurrentMonth = currentMonthCollections.some(collection => 
        collection.CollectionID === detail.CollectionID
      );
      
      // Chỉ cộng vào tổng nếu detail thuộc tháng hiện tại và đã đóng
      if (isInCurrentMonth && (detail.PaymentStatus === 'Đã đóng')) {
        // In ra thông tin chi tiết của các khoản phí đã đóng
        console.log('Khoản phí đã đóng:', {
          CollectionID: detail.CollectionID,
          Amount: detail.Amount,
          Status: detail.PaymentStatus
        });
        // Convert to number using parseFloat to ensure proper addition
        return sum + (parseFloat(detail.Amount) || 0);
      }
      return sum;
    }, 0);
    console.log('Tổng số tiền đã thu:', totalAmount);

    // Tính tỷ lệ hoàn thành (giả sử có 10 loại phí cần thu)
    const totalFeeTypes = 10; // Tổng số loại phí cần thu
    const completionRate = (uniqueFeeTypes / totalFeeTypes) * 100;

    setCurrentMonthStats({
      totalFeeTypes: uniqueFeeTypes,
      totalAmount: totalAmount,
      completionRate: completionRate.toFixed(1),
      completionLevel: getCompletionLevel(paymentPercentage),
      paymentPercentage: paymentPercentage.toFixed(1),
      totalFeeDetails: totalFeeDetails,
      paidFeeDetails: paidFeeDetails
    });
  }, [feeCollections, feeDetails]);

  const childrenCount = residents.filter(r => getAge(r.DateOfBirth || r.dateOfBirth) < 12).length;
  const teenCount = residents.filter(r => {
    const age = getAge(r.DateOfBirth || r.dateOfBirth);
    return age >= 12 && age <= 18;
  }).length;
  const adultCount = residents.filter(r => {
    const age = getAge(r.DateOfBirth || r.dateOfBirth);
    return age >= 19 && age <= 39;
  }).length;
  const middleAgeCount = residents.filter(r => {
    const age = getAge(r.DateOfBirth || r.dateOfBirth);
    return age >= 40 && age <= 65;
  }).length;
  const oldCount = residents.filter(r => getAge(r.DateOfBirth || r.dateOfBirth) > 65).length;

  const dataPie = [
    { name: 'Trẻ em', value: childrenCount },
    { name: 'Thanh niên', value: teenCount },
    { name: 'Trưởng thành', value: adultCount },
    { name: 'Trung niên', value: middleAgeCount },
    { name: 'Người già', value: oldCount },
  ];

  const totalHouseholds = households.length;
  const totalResidents = residents.length;

  const singleRooms = households.filter(h => h.Type === 'Đơn');
  const doubleRooms = households.filter(h => h.Type === 'Đôi');
  const availableSingleRooms = MAX_SINGLE_ROOMS - singleRooms.length;
  const availableDoubleRooms = MAX_DOUBLE_ROOMS - doubleRooms.length;

  const newComeCount = residents.filter(r => isWithin14Days(r.RegistrationDate)).length;
  const newLeaveCount = residents.filter(
    r => r.ResidencyStatus === "Đã chuyển đi" && isWithin14Days(r.RegistrationDate)
  ).length;

  const permanentCount = residents.filter(r => r.ResidencyStatus === "Thường trú").length;
  const temporaryCount = residents.filter(r => r.ResidencyStatus === "Tạm trú").length;

  return (
    <div className="home-container">
      <Header />
      <div className="home-body">
        <Sidebar open={open} setOpen={setOpen} />
        <div 
          className={`home-content ${open ? 'sidebar-open' : 'sidebar-closed'}`}
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 90px)', // Trừ đi chiều cao của header
            paddingBottom: '20px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#49aac0 #f1f1f1'
          }}
        >
          <div className="dashboard">
            {/* Hàng trên - 3 khối nhỏ */}
            <div className="dashboard-top">
              <div className="card small-card">
                <span className="card-title"><strong>Thông tin chung:</strong></span>
                <span className="card-title">🏠 Tổng số hộ: <strong>{totalHouseholds}/{MAX_HOUSEHOLD}</strong></span>
                <span className="card-title">🏠 Tổng số nhân khẩu: <strong>{totalResidents}</strong></span>
                <span className="card-title">🏠 Số phòng đơn còn: <strong>{availableSingleRooms}/{MAX_SINGLE_ROOMS}</strong></span>
                <span className="card-title">🏠 Số phòng đôi còn: <strong>{availableDoubleRooms}/{MAX_DOUBLE_ROOMS}</strong></span>
              </div>
              <div className="card small-card">
                <span className="card-title"><strong>Thống kê phí {getMonthName(new Date().getMonth())}:</strong></span>
                <span className="card-title">💰 Số loại phí thu trong tháng: <strong>{currentMonthStats.totalFeeTypes}</strong></span>
                <span className="card-title">💰 Tổng số tiền đã thu: <strong>{currentMonthStats.totalAmount.toLocaleString('vi-VN')} VNĐ</strong></span>
                <span className="card-title">💰 Tỷ lệ hoàn thành: <strong>{currentMonthStats.paymentPercentage}%</strong></span> 
                <span className="card-title">💰 Mức độ hoàn thành: <strong>{currentMonthStats.completionLevel}</strong></span>
              </div>
              <div className="card small-card">
                <span className="card-title"><strong>Trạng thái cư trú:</strong></span>
                <span className="card-title">🏡 Thường trú: <strong>{permanentCount}</strong></span>
                <span className="card-title">🏡 Tạm trú: <strong>{temporaryCount}</strong></span>
                <span className="card-title">🏡 Mới chuyển đến: <strong>{newComeCount}</strong></span>
                <span className="card-title">🏡 Mới chuyển đi: <strong>{newLeaveCount}</strong></span>
              </div>
            </div>

            {/* Hàng dưới - 2 khối biểu đồ lớn */}
            <div className="dashboard-bottom">
              <div className="card large-card">
                <h3 style={{ marginBottom: 16 }}>Biểu đồ cơ cấu nhân khẩu</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={dataPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {dataPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Home;