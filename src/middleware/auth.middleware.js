import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hr_backend_secret_key";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers.token;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  if (tokenHeader?.startsWith("Bearer ")) {
    return tokenHeader.split(" ")[1];
  }

  if (tokenHeader) {
    return tokenHeader;
  }

  return null;
};

export const protect = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again",
    });
  }
};
