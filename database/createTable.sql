-- Bảng Users
CREATE TABLE Users (
  UserID INT PRIMARY KEY AUTO_INCREMENT,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  FullName VARCHAR(100) NOT NULL,
  Email VARCHAR(100),
  PhoneNumber VARCHAR(20),
  Role ENUM('Tổ trưởng', 'Tổ phó', 'Thủ quỹ') NOT NULL,
  Status ENUM('Đang hoạt động', 'Đã nghỉ việc') DEFAULT 'Đang hoạt động',
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdateAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_fullname (FullName)
);

-- Bảng Households
CREATE TABLE Households (
  HouseholdID INT PRIMARY KEY AUTO_INCREMENT,
  RoomNumber VARCHAR(20) NOT NULL UNIQUE,
  Type ENUM('Đơn', 'Đôi') NOT NULL,
  HouseholdHead VARCHAR(50) NOT NULL,
  Members INT DEFAULT 0,
  HasVehicle BOOLEAN DEFAULT FALSE,
  Notes TEXT
);

-- Bảng Residents
CREATE TABLE Residents (
  ResidentID INT PRIMARY KEY AUTO_INCREMENT,
  HouseholdID INT,
  FullName VARCHAR(100) NOT NULL,
  DateOfBirth DATE,
  Sex ENUM('Nam', 'Nữ') NOT NULL,
  Relationship ENUM('Chủ hộ', 'Vợ', 'Chồng', 'Con', 'Cha', 'Mẹ', 'Anh', 'Chị', 'Em', 'Khác') NOT NULL,
  PhoneNumber VARCHAR(20),
  EducationLevel VARCHAR(50),
  Occupation VARCHAR(100),
  ResidencyStatus ENUM('Thường trú', 'Tạm trú', 'Tạm vắng', 'Đã chuyển đi') NOT NULL DEFAULT 'Tạm trú',
  RegistrationDate DATE,
  FOREIGN KEY (HouseholdID) REFERENCES Households(HouseholdID) ON DELETE CASCADE,
  INDEX idx_residents_household (HouseholdID),
  INDEX idx_residents_fullname (FullName)
);

-- Bảng FeeTypes
CREATE TABLE FeeTypes (
  FeeTypeID INT PRIMARY KEY AUTO_INCREMENT,
  FeeTypeName VARCHAR(100) NOT NULL,
  Description TEXT,
  Category ENUM('Bắt buộc', 'Tự nguyện') NOT NULL,
  Scope ENUM('Chung', 'Riêng') NOT NULL,
  UnitPrice DECIMAL(10,2),
  Unit VARCHAR(20)
);

-- Bảng FeeCollections
CREATE TABLE FeeCollections (
  CollectionID INT PRIMARY KEY AUTO_INCREMENT,
  FeeTypeID INT NOT NULL,
  CollectionName VARCHAR(100) NOT NULL,
  StartDate DATE NOT NULL,
  EndDate DATE,
  TotalAmount DECIMAL(15,2),
  Status ENUM('Đang thu', 'Hoàn thành', 'Kết thúc') NOT NULL,
  Notes TEXT,
  FOREIGN KEY (FeeTypeID) REFERENCES FeeTypes(FeeTypeID) ON DELETE RESTRICT,
  INDEX idx_feecollections_feetype (FeeTypeID)
);

-- Bảng FeeDetails
CREATE TABLE FeeDetails (
  FeeDetailID INT PRIMARY KEY AUTO_INCREMENT,
  CollectionID INT NOT NULL,
  HouseholdID INT NOT NULL,
  Amount DECIMAL(10,2),
  PaymentDate DATE,
  PaymentMethod ENUM('Tiền mặt', 'Chuyển khoản') NOT NULL,
  PaymentStatus ENUM('Chưa đóng', 'Đã đóng') NOT NULL,
  FOREIGN KEY (CollectionID) REFERENCES FeeCollections(CollectionID) ON DELETE CASCADE,
  FOREIGN KEY (HouseholdID) REFERENCES Households(HouseholdID) ON DELETE CASCADE,
  UNIQUE KEY uq_collection_household (CollectionID, HouseholdID),
  INDEX idx_feedetails_collection (CollectionID),
  INDEX idx_feedetails_household (HouseholdID)
);

-- Bảng Vehicles
CREATE TABLE Vehicles (
  VehicleID INT PRIMARY KEY AUTO_INCREMENT,
  HouseholdID INT,
  VehicleType ENUM('Xe máy', 'Ô tô') NOT NULL,
  LicensePlate VARCHAR(20) NOT NULL UNIQUE,
  Brand VARCHAR(50),
  Color VARCHAR(50),
  RegistrationDate DATE NOT NULL,
  Status ENUM('Còn hạn đăng ký gửi', 'Hết hạn đăng ký gửi') NOT NULL,
  FOREIGN KEY (HouseholdID) REFERENCES Households(HouseholdID) ON DELETE CASCADE,
  INDEX idx_vehicles_household (HouseholdID)
);
