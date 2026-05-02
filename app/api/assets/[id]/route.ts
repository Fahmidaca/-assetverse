import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireHR } from "@/lib/auth-middleware";
import Asset from "@/models/Asset";

// PATCH /api/assets/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const asset = await Asset.findOne({ _id: id, hrEmail: user!.email });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const allowed = ["productName", "productImage", "productType", "productQuantity"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    // If quantity changed, adjust availableQuantity by the same delta
    if (body.productQuantity !== undefined) {
      const currentAsset = await Asset.findById(id);
      if (currentAsset) {
        const delta = Number(body.productQuantity) - currentAsset.productQuantity;
        const newAvailable = Math.max(0, currentAsset.availableQuantity + delta);
        updates.availableQuantity = newAvailable;
      }
    }

    const updated = await Asset.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return NextResponse.json({ asset: updated });
  } catch (err) {
    console.error("Asset update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/assets/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const asset = await Asset.findOneAndDelete({ _id: id, hrEmail: user!.email });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Asset delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
