import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserRole } from "../constants/roles";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "add80324a44a7bb897ff4d31d0c550d09f2ea4e714906e1ab385889847b812d8";
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authorization header missing",
        errorCode: "UNAUTHORIZED",
      });
      return;
    }

    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token missing",
        errorCode: "UNAUTHORIZED",
      });
      return;
    }
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Token missing",
        errorCode: "UNAUTHORIZED",
      });
      return;
    }
    const user = await User.findById(payload.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User Not Found",
        errorCode: "UNAUTHORIZED",
      });
    }
    req.user = {
      id: user?._id.toString(),
      name: user?.name,
      email: user?.email,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised access",
      errorCode: "UNAUTHORIZED",
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Void => {
    if (!req.user || !roles.includes(res.user.role)) {
      res.status(401).json({
        success: false,
        message: "Forbidden: Access Denied",
        errorCode: "Forbidden",
      });
      return;
    }
    next();
  };
};
