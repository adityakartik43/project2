const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRole = req.user.role;

    // Admin is a superset — they can access both admin and resident routes
    if (userRole === "admin") {
      return next();
    }

    // Resident can only access routes explicitly marked for 'resident'
    if (userRole === "resident" && requiredRole === "resident") {
      return next();
    }

    // Any other case is forbidden
    return res.status(403).json({
      success: false,
      message: "Forbidden: you do not have permission to access this resource.",
    });
  };
};

export default roleMiddleware;