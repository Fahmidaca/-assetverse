import mongoose, { Schema, Document } from "mongoose";

export interface IAsset extends Document {
  productName: string;
  productImage: string;
  productType: "returnable" | "non-returnable";
  productQuantity: number;
  availableQuantity: number;
  hrEmail: string;
  companyName: string;
}

const AssetSchema = new Schema<IAsset>(
  {
    productName: { type: String, required: true, trim: true },
    productImage: { type: String, default: "" },
    productType: { type: String, enum: ["returnable", "non-returnable"], required: true },
    productQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    hrEmail: { type: String, required: true, lowercase: true },
    companyName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
