-- DELIMITER thiết lập $$ cho toàn bộ các Trigger

-- 1. Khi thay đổi HouseholdHead trong Households, đồng bộ tên sang Residents
DELIMITER $$
CREATE TRIGGER trg_update_household_head
AFTER UPDATE ON Households
FOR EACH ROW
BEGIN
  IF NEW.HouseholdHead <> OLD.HouseholdHead THEN
    UPDATE Residents
    SET FullName = NEW.HouseholdHead
    WHERE HouseholdID = NEW.HouseholdID AND Relationship = 'Chủ hộ';
  END IF;
END$$
DELIMITER ;

-- 2. Triggers trên bảng Residents: Đồng bộ Chủ hộ và tự động cập nhật Members count
DELIMITER $$

CREATE TRIGGER trg_after_insert_resident
AFTER INSERT ON Residents
FOR EACH ROW
BEGIN
  -- Đồng bộ tên Chủ hộ từ Residents -> Households
  IF NEW.Relationship = 'Chủ hộ' AND NEW.HouseholdID IS NOT NULL THEN
    UPDATE Households
    SET HouseholdHead = NEW.FullName
    WHERE HouseholdID = NEW.HouseholdID;
  END IF;

  -- Tăng số lượng thành viên của hộ dân
  IF NEW.HouseholdID IS NOT NULL THEN
    UPDATE Households
    SET Members = Members + 1
    WHERE HouseholdID = NEW.HouseholdID;
  END IF;
END$$

CREATE TRIGGER trg_after_delete_resident
AFTER DELETE ON Residents
FOR EACH ROW
BEGIN
  -- Giảm số lượng thành viên của hộ dân
  IF OLD.HouseholdID IS NOT NULL THEN
    UPDATE Households
    SET Members = CASE WHEN Members > 0 THEN Members - 1 ELSE 0 END
    WHERE HouseholdID = OLD.HouseholdID;
  END IF;
END$$

CREATE TRIGGER trg_after_update_resident
AFTER UPDATE ON Residents
FOR EACH ROW
BEGIN
  -- Đồng bộ tên Chủ hộ từ Residents -> Households nếu đổi tên hoặc vai trò thành Chủ hộ
  IF NEW.Relationship = 'Chủ hộ' AND (OLD.Relationship <> 'Chủ hộ' OR NEW.FullName <> OLD.FullName) AND NEW.HouseholdID IS NOT NULL THEN
    UPDATE Households
    SET HouseholdHead = NEW.FullName
    WHERE HouseholdID = NEW.HouseholdID;
  END IF;

  -- Cập nhật số thành viên nếu chuyển hộ dân (HouseholdID thay đổi)
  IF COALESCE(NEW.HouseholdID, 0) <> COALESCE(OLD.HouseholdID, 0) THEN
    -- Giảm ở hộ cũ
    IF OLD.HouseholdID IS NOT NULL THEN
      UPDATE Households
      SET Members = CASE WHEN Members > 0 THEN Members - 1 ELSE 0 END
      WHERE HouseholdID = OLD.HouseholdID;
    END IF;
    -- Tăng ở hộ mới
    IF NEW.HouseholdID IS NOT NULL THEN
      UPDATE Households
      SET Members = Members + 1
      WHERE HouseholdID = NEW.HouseholdID;
    END IF;
  END IF;
END$$

DELIMITER ;

-- 3. Triggers trên bảng Vehicles: Cập nhật tự động cờ HasVehicle trong Households
DELIMITER $$

CREATE TRIGGER trg_after_insert_vehicle
AFTER INSERT ON Vehicles
FOR EACH ROW
BEGIN
  IF NEW.HouseholdID IS NOT NULL THEN
    UPDATE Households
    SET HasVehicle = TRUE
    WHERE HouseholdID = NEW.HouseholdID;
  END IF;
END$$

CREATE TRIGGER trg_after_delete_vehicle
AFTER DELETE ON Vehicles
FOR EACH ROW
BEGIN
  DECLARE vehicle_count INT;
  
  IF OLD.HouseholdID IS NOT NULL THEN
    SELECT COUNT(*) INTO vehicle_count
    FROM Vehicles
    WHERE HouseholdID = OLD.HouseholdID;

    IF vehicle_count = 0 THEN
      UPDATE Households
      SET HasVehicle = FALSE
      WHERE HouseholdID = OLD.HouseholdID;
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_after_update_vehicle
AFTER UPDATE ON Vehicles
FOR EACH ROW
BEGIN
  DECLARE old_vehicle_count INT;
  
  -- Nếu thay đổi HouseholdID của xe
  IF COALESCE(NEW.HouseholdID, 0) <> COALESCE(OLD.HouseholdID, 0) THEN
    -- Đánh dấu hộ mới là có xe
    IF NEW.HouseholdID IS NOT NULL THEN
      UPDATE Households
      SET HasVehicle = TRUE
      WHERE HouseholdID = NEW.HouseholdID;
    END IF;
    
    -- Kiểm tra hộ cũ còn xe nào không
    IF OLD.HouseholdID IS NOT NULL THEN
      SELECT COUNT(*) INTO old_vehicle_count
      FROM Vehicles
      WHERE HouseholdID = OLD.HouseholdID;

      IF old_vehicle_count = 0 THEN
        UPDATE Households
        SET HasVehicle = FALSE
        WHERE HouseholdID = OLD.HouseholdID;
      END IF;
    END IF;
  END IF;
END$$

DELIMITER ;