import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserRole } from "../constants/roles";
import "dotenv/config";
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
router.post("/register", async (req: Request, res: Response): Promise<void> => {

  try {
    const { name, email, password, role } = req.body || {};
    if (!name || name.length < 2 || name.length > 50) {
      res.status(400).json({
        success: false,
        message: "Name is required and must be betweeb 2 to 50 character",
        ErrorCode: "VALIDATION_ERROR",
      });
      return;
    }
    if (!email || !email.includes("@")) {
      res.status(400).json({
        success: false,
        message: "Valid email is required",
        ErrorCode: "VALIDATION_ERROR",
      });
      return;
    }
    if (!password || password.length < 6 || password.length > 100) {
      res.status(400).json({
        success: false,
        message: "Password must be atlest 6 character",
        ErrorCode: "VALIDATION_ERROR",
      });
      return;
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email is already exists",
        ErrorCode: "VALIDATION_ERROR",
      });
      return;
    }
    const userRole = typeof role === "string" ? role.toUpperCase() : undefined;
    const newUser = await User.create({
      name,
      email,
      password,
      role: userRole || UserRole.USER,
    });
    res.status(201).json({
      success: true,
      message: "User registered Successfully",
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
      ErrorCode: "REGISTRATION ERROR 4545",
    });
    return;
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
        ErrorCode: "VALIDATION ERROR",
      });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({
        success: false,
        message: "Invalid Email and password are required",
        ErrorCode: "VALIDATION ERROR",
      });
      return;
    }
    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(
      {
        id: userPayload.id,
        email: userPayload.email,
        role: userPayload.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any },
    );
    res.status(200).json({
      success: true,
      message: "Login Successfully",
      data: {
        token,
        user: userPayload,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Login failed",
      ErrorCode: "VALIDATION ERROR",
    });
  }
});

export default router;