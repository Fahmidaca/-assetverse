import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth-middleware";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const dbUser = await User.findOne({ email: user!.email });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      dateOfBirth: dbUser.dateOfBirth,
      profileImage: dbUser.profileImage,
      companyName: dbUser.companyName,
      companyLogo: dbUser.companyLogo,
      packageLimit: dbUser.packageLimit,
      currentEmployees: dbUser.currentEmployees,
      subscription: dbUser.subscription,
      position: dbUser.position,
      affiliatedCompany: dbUser.affiliatedCompany,
      affiliatedHrEmail: dbUser.affiliatedHrEmail,
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    const allowed = ["name", "dateOfBirth", "profileImage", "companyName", "companyLogo", "position"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await User.findOneAndUpdate(
      { email: user!.email },
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
