import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "hr" | "employee";
  dateOfBirth?: string;
  profileImage?: string;
  companyName?: string;
  companyLogo?: string;
  packageLimit?: number;
  currentEmployees?: number;
  subscription?: "basic" | "standard" | "premium";
  position?: string;
  affiliatedCompany?: string;
  affiliatedHrEmail?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["hr", "employee"], required: true },
    dateOfBirth: { type: String },
    profileImage: { type: String, default: "" },
    // HR fields
    companyName: { type: String },
    companyLogo: { type: String },
    packageLimit: { type: Number, default: 5 },
    currentEmployees: { type: Number, default: 0 },
    subscription: { type: String, enum: ["basic", "standard", "premium"], default: "basic" },
    // Employee fields
    position: { type: String },
    affiliatedCompany: { type: String },
    affiliatedHrEmail: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
