import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, requireHR } from "@/lib/auth-middleware";
import Request from "@/models/Request";
import Asset from "@/models/Asset";
import User from "@/models/User";
import Affiliation from "@/models/Affiliation";

// PATCH /api/requests/:id — Approve, Reject, or Return
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const { action } = await req.json();

    const request = await Request.findById(id);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    // HR actions: approve / reject
    if (action === "approve" || action === "reject") {
      if (user!.role !== "hr" || request.hrEmail !== user!.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (action === "approve") {
        const asset = await Asset.findById(request.assetId);
        if (!asset || asset.availableQuantity < 1) {
          return NextResponse.json({ error: "Asset no longer available" }, { status: 400 });
        }

        // Check package limit — count unique affiliated employees, not total requests
        const hrUser = await User.findOne({ email: user!.email });
        const currentCount = await Affiliation.countDocuments({
          hrEmail: user!.email,
          status: "active",
        });
        if (hrUser && currentCount >= (hrUser.packageLimit || 5)) {
          return NextResponse.json(
            { error: "Package limit reached. Please upgrade your plan." },
            { status: 403 }
          );
        }

        // Reduce stock
        await Asset.findByIdAndUpdate(request.assetId, {
          $inc: { availableQuantity: -1 },
        });

        // Auto-create affiliation if not exists
        const existingAffiliation = await Affiliation.findOne({
          employeeEmail: request.requesterEmail,
          hrEmail: user!.email,
        });
        if (!existingAffiliation) {
          await Affiliation.create({
            employeeEmail: request.requesterEmail,
            employeeName: request.requesterName,
            employeeImage: request.requesterImage,
            companyName: request.companyName,
            hrEmail: user!.email,
            status: "active",
          });
          // Update employee's affiliated company
          await User.findOneAndUpdate(
            { email: request.requesterEmail },
            {
              $set: {
                affiliatedCompany: request.companyName,
                affiliatedHrEmail: user!.email,
              },
            }
          );
          // Update HR employee count
          await User.findOneAndUpdate(
            { email: user!.email },
            { $inc: { currentEmployees: 1 } }
          );
        }

        request.status = "approved";
        request.approvalDate = new Date();
      } else {
        request.status = "rejected";
      }
    }

    // Employee action: return
    if (action === "return") {
      if (user!.role !== "employee" || request.requesterEmail !== user!.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (request.assetType !== "returnable") {
        return NextResponse.json({ error: "This asset is non-returnable" }, { status: 400 });
      }
      if (request.status !== "approved") {
        return NextResponse.json({ error: "Can only return approved assets" }, { status: 400 });
      }

      // Restore stock
      await Asset.findByIdAndUpdate(request.assetId, {
        $inc: { availableQuantity: 1 },
      });

      request.status = "returned";
      request.returnDate = new Date();
    }

    await request.save();
    return NextResponse.json({ request });
  } catch (err) {
    console.error("Request update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/requests/:id — Employee cancels pending request
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = requireAuth(req);
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const request = await Request.findOne({
      _id: id,
      requesterEmail: user!.email,
      status: "pending",
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    await request.deleteOne();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Request delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
