import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-middleware";
import User from "@/models/User";
import Asset from "@/models/Asset";
import Request from "@/models/Request";
import Affiliation from "@/models/Affiliation";
import Payment from "@/models/Payment";

// GET /api/admin/db?collection=users — peek at backend data (auth required)
export async function GET(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection") || "users";
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));

    const models: Record<string, any> = {
      users: User,
      assets: Asset,
      requests: Request,
      affiliations: Affiliation,
      payments: Payment,
    };

    const Model = models[collection];
    if (!Model) {
      return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
    }

    const [docs, count] = await Promise.all([
      Model.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Model.countDocuments(),
    ]);

    // Counts for all collections (for sidebar)
    const counts = await Promise.all(
      Object.entries(models).map(async ([name, M]) => [name, await M.countDocuments()])
    );

    return NextResponse.json({
      collection,
      total: count,
      shown: docs.length,
      counts: Object.fromEntries(counts),
      docs,
    });
  } catch (err) {
    console.error("Admin DB error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
