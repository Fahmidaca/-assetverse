import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireHR } from "@/lib/auth-middleware";
import Affiliation from "@/models/Affiliation";
import User from "@/models/User";

// DELETE /api/employees/:email — HR removes an employee
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = requireHR(req);
  if (error) return error;

  try {
    await connectDB();
    const { id: employeeEmail } = await params;

    const affiliation = await Affiliation.findOneAndDelete({
      employeeEmail: decodeURIComponent(employeeEmail),
      hrEmail: user!.email,
    });

    if (!affiliation) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Clear employee's affiliation
    await User.findOneAndUpdate(
      { email: decodeURIComponent(employeeEmail) },
      { $unset: { affiliatedCompany: "", affiliatedHrEmail: "" } }
    );

    // Decrease HR employee count — only if above 0
    await User.findOneAndUpdate(
      { email: user!.email, currentEmployees: { $gt: 0 } },
      { $inc: { currentEmployees: -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Employee remove error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
