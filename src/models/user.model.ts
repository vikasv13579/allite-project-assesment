import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";
import bcrypt from "bcryptjs";
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Must Be atleast 2 character"],
      maxLength: [50, "Name  cannot be more that 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minLength: [6, "Must Be atleast 6 character"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Priority must be low , medium, high",
      },
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function() {
     if(!this.isModified('password')){
        return 
     }
     try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
     } catch (error: any) {
     }
})

userSchema.methods.comparePassword =  async function(candidatePassword: string): Promise<boolean>{
    return bcrypt.compare(candidatePassword, this.password)
}
export const User = model<IUser>('User', userSchema)