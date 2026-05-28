import jwt from "jsonwebtoken";

// Middleware xác thực Token JWT
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: true, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(401).json({ error: true, message: "Invalid token format" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: true, message: "Failed to authenticate token" });
    }
    
    // Lưu thông tin người dùng vào request
    req.user = decoded; // { id: UserID, role: Role }
    next();
  });
};

// Middleware kiểm tra vai trò người dùng (Role-based)
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: true, message: "Access denied: No role specified" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: "Access denied: Insufficient permissions" });
    }

    next();
  };
};

// Middleware kiểm tra chính mình hoặc có vai trò tương ứng (Self-care or Admin)
export const verifySelfOrRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const userIdParam = parseInt(req.params.id, 10);
    // Nếu người dùng thao tác tài khoản chính mình HOẶC có vai trò trong danh sách được cho phép
    if (req.user.id === userIdParam || (req.user.role && allowedRoles.includes(req.user.role))) {
      return next();
    }

    return res.status(403).json({ error: true, message: "Access denied: Insufficient permissions" });
  };
};
