import { Schema, model, Document, Types } from "mongoose";
import { TaskStatus, TaskPriority } from "../constants/roles";

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  dueDate: Date;
  CreatedAt: Date;
  UpdatedAt: Date;
}

const taskShema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minLength: [1, "Title cannot be empty"],
      maxLength: [150, "Title cannot be empty"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [1000, "Description cannot be empty"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: "Statue must todo, inprogress or completed",
      },
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TaskPriority),
        message: "Priority must be low , medium, high",
      },
      default: TaskPriority.MEDIUM,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task created by is requiured"],
    },
    dueDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret._v;
        return ret;
      },
    },
  },
);
export const Task = model<ITask>('Task', taskShema)