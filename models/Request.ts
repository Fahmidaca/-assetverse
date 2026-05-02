import mongoose, { Schema, Document } from "mongoose";

export interface IRequest extends Document {
  assetId: string;
  assetName: string;
  assetImage: string;
  assetType: string;
  requesterEmail: string;
  requesterName: string;
  requesterImage?: string;
  hrEmail: string;
  companyName: string;
  status: "pending" | "approved" | "rejected" | "returned";
  note?: string;
  requestDate: Date;
  approvalDate?: Date;
  returnDate?: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    assetId: { type: String, required: true },
    assetName: { type: String, required: true },
    assetImage: { type: String },
    assetType: { type: String },
    requesterEmail: { type: String, required: true, lowercase: true },
    requesterName: { type: String, required: true },
    requesterImage: { type: String },
    hrEmail: { type: String, required: true, lowercase: true },
    companyName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned"],
      default: "pending",
    },
    note: { type: String },
    requestDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    returnDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Request || mongoose.model<IRequest>("Request", RequestSchema);
