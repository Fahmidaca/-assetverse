export type UserRole = "hr" | "employee";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  dateOfBirth?: string;
  profileImage?: string;
  // HR-specific
  companyName?: string;
  companyLogo?: string;
  packageLimit?: number;
  currentEmployees?: number;
  subscription?: "basic" | "standard" | "premium";
  // Employee-specific
  position?: string;
  affiliatedCompany?: string;
  affiliatedHrEmail?: string;
  createdAt?: string;
}

export interface Asset {
  _id?: string;
  productName: string;
  productImage: string;
  productType: "returnable" | "non-returnable";
  productQuantity: number;
  availableQuantity: number;
  hrEmail: string;
  companyName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetRequest {
  _id?: string;
  assetId: string;
  assetName?: string;
  assetImage?: string;
  assetType?: string;
  requesterEmail: string;
  requesterName?: string;
  hrEmail: string;
  companyName?: string;
  status: "pending" | "approved" | "rejected" | "returned";
  note?: string;
  requestDate?: string;
  approvalDate?: string;
  returnDate?: string;
}

export interface EmployeeAffiliation {
  _id?: string;
  employeeEmail: string;
  employeeName?: string;
  employeeImage?: string;
  companyName: string;
  hrEmail: string;
  status: "pending" | "active";
  joinDate?: string;
  position?: string;
}

export interface Package {
  _id?: string;
  name: string;
  employeeLimit: number;
  price: number;
  features: string[];
  stripePriceId?: string;
}

export interface Payment {
  _id?: string;
  hrEmail: string;
  packageName: string;
  amount: number;
  transactionId: string;
  status: "success" | "pending" | "failed";
  createdAt?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
