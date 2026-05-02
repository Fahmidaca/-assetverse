import mongoose, { Schema, Document } from "mongoose";

export interface IAffiliation extends Document {
  employeeEmail: string;
  employeeName: string;
  employeeImage?: string;
  companyName: string;
  hrEmail: string;
  status: "pending" | "active";
  position?: string;
  joinDate: Date;
}

const AffiliationSchema = new Schema<IAffiliation>(
  {
    employeeEmail: { type: String, required: true, lowercase: true },
    employeeName: { type: String, required: true },
    employeeImage: { type: String },
    companyName: { type: String, required: true },
    hrEmail: { type: String, required: true, lowercase: true },
    status: { type: String, enum: ["pending", "active"], default: "active" },
    position: { type: String, default: "Employee" },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Affiliation ||
  mongoose.model<IAffiliation>("Affiliation", AffiliationSchema);
