import dotenv from "dotenv";
dotenv.config();

export const defaultUser = {
  Username: process.env.DEFAULT_ADMIN_USERNAME || "admin1234",
  Password: process.env.DEFAULT_ADMIN_PASSWORD || "1234",
  FullName: "Nguyễn Bá Tú",
  Email: "admin123@gmail.com",
  PhoneNumber: "0123456789",
  Role: "Tổ trưởng",
};
