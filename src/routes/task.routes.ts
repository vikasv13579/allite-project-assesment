import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Task } from "../models/task.model";
import { UserRole } from "../constants/roles";
import { Schema, model, Document, Types } from "mongoose";
import "dotenv/config";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { addTaskJob } from "../queue/task.queue";

const router = Router();
router.use(authenticate);
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      createdBy,
    } = req.body || {};
    if (!title || typeof title !== "string") {
      res.status(400).json({
        success: false,
        message: "Task title is required",
        errorCode: "VALIDATION ERROR",
      });
    }
    if (assignedTo) {
      if (!Types.ObjectId.isValid(assignedTo)) {
        res.status(400).json({
          success: false,
          message: "Assigned User Not Found",
          errorCode: "USER_NOT_FOUND",
        });
      }
    }
    const userExists = await User.findById(assignedTo);
    if (!userExists) {
      res.status(400).json({
        success: false,
        message: "Assigned User Not Found",
        errorCode: "USER_NOT_FOUND",
      });
    }
    const created = await Task.create({
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo || undefined,
      dueDate,
      createdBy,
    });
    const task = await Task.findById(created._id).populate(
      "assignedTo createdBy",
      "name email role",
    );
    if (task) {
      await addTaskJob("TASK_CREATED", {
        task_id: task._id.toString(),
        title: task.title,
        assignedToEmail: (task.assignedTo as any)?.email,
      });
    }
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "failed to create task",
      errorCode: "TASK_CREATE_ERROR",
    });
  }
});
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = page - 1;
    const filter: any = {};
    const currentUSer = req.user!;
    if (currentUSer.role !== UserRole.ADMIN) {
      filter.$or = [
        { assignTo: currentUSer.id },
        { createdBy: currentUSer.id },
      ];
    }
    //    filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $option: "i" };
    }
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const [task, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo createdBy", "name email role"),
      Task.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: {
        task,
        pegination: {
          page,
          limit,
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "failed to create task",
      errorCode: "Internal server error",
    });
  }
});
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID",
        errorCode: "INVALID_TASK_ID",
      });
      return;
    }
    const task = await Task.findById(id).populate(
      "assignedTo createdBy",
      "name email role",
    );
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
        errorCode: "TASK_NOT_FOUND",
      });
      return;
    }
    const currentUSer = req.user!;
    if (currentUSer.role !== UserRole.ADMIN) {
       const assignedToId = (task.assignedTo as any)?._id?.toString();
       const createdById = (task.createdBy as any)?._id?.toString();
       if (assignedToId !== currentUSer.id && createdById !== currentUSer.id) {
         res.status(403).json({
           success: false,
           message: "Access denied",
           errorCode: "ACCESS_DENIED",
         });
         return;
       }
    }
    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "failed to create task",
      errorCode: "Internal server error",
    });
  }
});
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo } = req.body;
    const currentUSer = req.user!;
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
        errorCode: "TASK_NOT_FOUND",
      });
      return;
    }
    const assignedToId = (task.assignedTo as any)?._id?.toString();
    const createdById = (task.createdBy as any)?._id?.toString();
    if (assignedToId !== currentUSer.id && createdById !== currentUSer.id) {
      res.status(403).json({
        success: false,
        message: "Access denied",
        errorCode: "ACCESS_DENIED",
      });
      return;
    }
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, status, priority, assignedTo },
      { new: true }
    ).populate("assignedTo createdBy", "name email role");
    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "failed to update task",
      errorCode: "Internal server error",
    });
  }
});
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUSer = req.user!;
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
        errorCode: "TASK_NOT_FOUND",
      });
      return;
    }
    const assignedToId = (task.assignedTo as any)?._id?.toString();
    const createdById = (task.createdBy as any)?._id?.toString();
    if (assignedToId !== currentUSer.id && createdById !== currentUSer.id) {
      res.status(403).json({
        success: false,
        message: "Access denied",
        errorCode: "ACCESS_DENIED",
      });   
      return;
    }
    await Task.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "failed to delete task",
      errorCode: "Internal server error",
    });
  }
});
export default router;
