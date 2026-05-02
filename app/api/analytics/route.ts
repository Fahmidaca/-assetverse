import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireHR } from "@/lib/auth-middleware";
import Asset from "@/models/Asset";
import Request from "@/models/Request";

export async function GET(req: NextRequest) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();

    // Assets by type (returnable vs non-returnable)
    const [returnable, nonReturnable] = await Promise.all([
      Asset.countDocuments({ hrEmail: user!.email, productType: "returnable" }),
      Asset.countDocuments({ hrEmail: user!.email, productType: "non-returnable" }),
    ]);

    // Top requested assets
    const topRequested = await Request.aggregate([
      { $match: { hrEmail: user!.email } },
      { $group: { _id: "$assetName", count: { $sum: 1 }, assetId: { $first: "$assetId" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    // Request status breakdown
    const statusBreakdown = await Request.aggregate([
      { $match: { hrEmail: user!.email } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Monthly requests for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRequests = await Request.aggregate([
      { $match: { hrEmail: user!.email, requestDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$requestDate" },
            month: { $month: "$requestDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return NextResponse.json({
      assetTypes: [
        { name: "Returnable", value: returnable },
        { name: "Non-Returnable", value: nonReturnable },
      ],
      topRequested,
      statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
      monthlyRequests: monthlyRequests.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
        count: m.count,
      })),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
