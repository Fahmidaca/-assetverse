import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-middleware";
import Affiliation from "@/models/Affiliation";
import User from "@/models/User";

// GET /api/team — Employee sees their teammates
export async function GET(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const emp = await User.findOne({ email: user!.email });

    let hrEmail = emp?.affiliatedHrEmail;

    // HR can also view their team
    if (user!.role === "hr") {
      hrEmail = user!.email;
    }

    if (!hrEmail) {
      return NextResponse.json({ team: [], upcomingBirthdays: [] });
    }

    const team = await Affiliation.find({ hrEmail, status: "active" });

    // Batch user lookup — no N+1
    const emails = team.map((m) => m.employeeEmail);
    const users = await User.find({ email: { $in: emails } });
    const userMap: Record<string, typeof users[0]> = {};
    for (const u of users) userMap[u.email] = u;

    const enriched = team.map((member) => {
      const u = userMap[member.employeeEmail];
      return {
        ...member.toObject(),
        dateOfBirth: u?.dateOfBirth,
        profileImage: u?.profileImage || member.employeeImage,
        position: u?.position || "Employee",
      };
    });

    // Upcoming birthdays in next 30 days
    const today = new Date();
    const in30 = new Date();
    in30.setDate(today.getDate() + 30);

    const upcomingBirthdays = enriched.filter((m) => {
      if (!m.dateOfBirth) return false;
      const dob = new Date(m.dateOfBirth);
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      return thisYear >= today && thisYear <= in30;
    });

    return NextResponse.json({ team: enriched, upcomingBirthdays });
  } catch (err) {
    console.error("Team fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
