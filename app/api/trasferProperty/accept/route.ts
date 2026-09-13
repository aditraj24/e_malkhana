import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Case } from "@/models/Case";
import { Property } from "@/models/Property";
import { TransferRequest } from "@/models/TransferRequest";

/* ───── PATCH — accept or reject a transfer item ───── */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const userId = (session.user as any).id;
  const body = await req.json();
  const { transferRequestId, itemId, action } = body;

  if (!transferRequestId || !itemId || !["ACCEPTED", "REJECTED"].includes(action)) {
    return NextResponse.json(
      { error: "transferRequestId, itemId, and action (ACCEPTED/REJECTED) required" },
      { status: 400 }
    );
  }

  const transferReq = await TransferRequest.findById(transferRequestId);
  if (!transferReq) {
    return NextResponse.json({ error: "Transfer request not found" }, { status: 404 });
  }

  // Only the receiving officer can accept/reject
  if (transferReq.toOfficer.toString() !== userId) {
    return NextResponse.json(
      { error: "Only the receiving officer can accept/reject" },
      { status: 403 }
    );
  }

  const item = transferReq.items.find(
    (i: any) => i._id.toString() === itemId
  );
  if (!item) {
    return NextResponse.json({ error: "Item not found in this transfer" }, { status: 404 });
  }

  if (item.status !== "PENDING") {
    return NextResponse.json(
      { error: `Item already ${item.status.toLowerCase()}` },
      { status: 400 }
    );
  }

  item.status = action;

  if (action === "ACCEPTED") {
    if (item.itemType === "CASE") {
      // Transfer case ownership - set reportingOfficer to accepting officer
      // reportedOfficer can be cleared or kept as is
      await Case.findByIdAndUpdate(item.itemId, {
        reportingOfficer: userId,
        reportedOfficer: null, // Clear reportedOfficer as transfer is complete
      });

      // Also transfer all properties related to this case
      await Property.updateMany(
        { caseId: item.itemId },
        {
          currentOfficer: userId,
          lastMovementAt: new Date()
        }
      );
    } else {
      // Transfer property ownership
      await Property.findByIdAndUpdate(item.itemId, {
        currentOfficer: userId,
        lastMovementAt: new Date()
      });
    }
  } else {
    // REJECTED — no changes needed to cases or properties as they weren't modified during request creation
  }

  // Check if all items have been acted upon
  const allActedOn = transferReq.items.every(
    (i: any) => i.status !== "PENDING"
  );
  if (allActedOn) {
    transferReq.status = "COMPLETED";
  }

  await transferReq.save();

  return NextResponse.json({
    message: `Item ${action.toLowerCase()} successfully`,
    transferStatus: transferReq.status,
  });
}
