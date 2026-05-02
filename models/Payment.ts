import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  hrEmail: string;
  packageName: string;
  amount: number;
  transactionId: string;
  status: "success" | "pending" | "failed";
  newLimit: number;
}

const PaymentSchema = new Schema<IPayment>(
  {
    hrEmail: { type: String, required: true, lowercase: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: ["success", "pending", "failed"], default: "pending" },
    newLimit: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
