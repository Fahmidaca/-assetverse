import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-middleware";
import Request from "@/models/Request";
import Asset from "@/models/Asset";
import User from "@/models/User";
import Affiliation from "@/models/Affiliation";

// GET /api/requests
export async function GET(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> =
      user!.role === "hr"
        ? { hrEmail: user!.email }
        : { requesterEmail: user!.email };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.assetName = { $regex: escaped, $options: "i" };
    }
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      Request.find(query).sort({ requestDate: -1 }).skip(skip).limit(limit),
      Request.countDocuments(query),
    ]);

    return NextResponse.json({ requests, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Requests fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/requests — Employee requests an asset
export async function POST(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  if (user!.role !== "employee") {
    return NextResponse.json({ error: "Only employees can request assets" }, { status: 403 });
  }

  try {
    await connectDB();
    const { assetId, note } = await req.json();

    const asset = await Asset.findById(assetId);
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    if (asset.availableQuantity < 1) {
      return NextResponse.json({ error: "Asset is out of stock" }, { status: 400 });
    }

    // Check if already requested and pending
    const existing = await Request.findOne({
      assetId,
      requesterEmail: user!.email,
      status: "pending",
    });
    if (existing) {
      return NextResponse.json({ error: "You already have a pending request for this asset" }, { status: 409 });
    }

    const emp = await User.findOne({ email: user!.email });

    // Prevent cross-company requests: if already affiliated with a different company, block
    if (emp?.affiliatedHrEmail && emp.affiliatedHrEmail !== asset.hrEmail) {
      return NextResponse.json(
        { error: "You are already affiliated with another company. You can only request assets from your company." },
        { status: 403 }
      );
    }

    const request = await Request.create({
      assetId,
      assetName: asset.productName,
      assetImage: asset.productImage,
      assetType: asset.productType,
      requesterEmail: user!.email,
      requesterName: user!.name,
      requesterImage: emp?.profileImage || "",
      hrEmail: asset.hrEmail,
      companyName: asset.companyName,
      note,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    console.error("Request create error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
