import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, requireHR } from "@/lib/auth-middleware";
import Asset from "@/models/Asset";
import User from "@/models/User";

// GET /api/assets — HR: own assets; Employee: their company's assets
export async function GET(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};

    if (user!.role === "hr") {
      query.hrEmail = user!.email;
    } else {
      // Employee sees their company's assets
      const emp = await User.findOne({ email: user!.email });
      if (!emp?.affiliatedHrEmail) {
        return NextResponse.json({ assets: [], total: 0 });
      }
      query.hrEmail = emp.affiliatedHrEmail;
      query.availableQuantity = { $gt: 0 };
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.productName = { $regex: escaped, $options: "i" };
    }
    if (type) query.productType = type;

    const [assets, total] = await Promise.all([
      Asset.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Asset.countDocuments(query),
    ]);

    return NextResponse.json({ assets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Assets fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/assets — HR only
export async function POST(req: NextRequest) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    const { productName, productImage, productType, productQuantity } = body;

    if (!productName || !productType || productQuantity == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hrUser = await User.findOne({ email: user!.email });

    const asset = await Asset.create({
      productName,
      productImage: productImage || "",
      productType,
      productQuantity: Number(productQuantity),
      availableQuantity: Number(productQuantity),
      hrEmail: user!.email,
      companyName: hrUser?.companyName || "",
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    console.error("Asset create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
