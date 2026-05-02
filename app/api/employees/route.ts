import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireHR } from "@/lib/auth-middleware";
import Affiliation from "@/models/Affiliation";
import User from "@/models/User";
import Request from "@/models/Request";

// GET /api/employees — HR gets all affiliated employees
export async function GET(req: NextRequest) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = { hrEmail: user!.email, status: "active" };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.employeeName = { $regex: escaped, $options: "i" };
    }

    const affiliations = await Affiliation.find(query).sort({ joinDate: -1 });

    // Batch asset count in a single aggregation — no N+1
    const emails = affiliations.map((a) => a.employeeEmail);
    const [assetCounts, hrUser] = await Promise.all([
      Request.aggregate([
        { $match: { requesterEmail: { $in: emails }, hrEmail: user!.email, status: "approved" } },
        { $group: { _id: "$requesterEmail", count: { $sum: 1 } } },
      ]),
      User.findOne({ email: user!.email }),
    ]);

    const countMap: Record<string, number> = {};
    for (const row of assetCounts) countMap[row._id] = row.count;

    const enriched = affiliations.map((aff) => ({
      ...aff.toObject(),
      assetCount: countMap[aff.employeeEmail] || 0,
    }));

    return NextResponse.json({
      employees: enriched,
      total: enriched.length,
      packageLimit: hrUser?.packageLimit || 5,
    });
  } catch (err) {
    console.error("Employees fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
