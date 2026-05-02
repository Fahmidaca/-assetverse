import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, role, dateOfBirth, companyName, companyLogo } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!["hr", "employee"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: Record<string, unknown> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      dateOfBirth,
    };

    if (role === "hr") {
      if (!companyName) {
        return NextResponse.json({ error: "Company name is required for HR" }, { status: 400 });
      }
      userData.companyName = companyName;
      userData.companyLogo = companyLogo || "";
      userData.packageLimit = 5;
      userData.currentEmployees = 0;
      userData.subscription = "basic";
    }

    const user = await User.create(userData);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        profileImage: user.profileImage,
        packageLimit: user.packageLimit,
        currentEmployees: user.currentEmployees,
        subscription: user.subscription,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    const dbDown = error?.name === "MongooseServerSelectionError" || error?.message?.includes("ECONNREFUSED");
    return NextResponse.json(
      {
        error: dbDown
          ? "Database is not connected. If this is a fresh install, set MONGODB_URI in .env.local or wait for the in-memory database to finish initializing."
          : "Server error",
      },
      { status: 500 }
    );
  }
}
