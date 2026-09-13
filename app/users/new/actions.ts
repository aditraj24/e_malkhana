"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { asyncHandler } from "@/lib/async-handler";

export const createUser = asyncHandler(async (formData: {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: string;
  officerId: string;
  policeStation: string;
}) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  if ((session.user as any)?.role !== "ADMIN") {
    throw new Error("Only admins can create users");
  }

  await connectDB();

  const existing = await User.findOne({
    $or: [
      { username: formData.username.toLowerCase() },
      { email: formData.email.toLowerCase() },
      { officerId: new RegExp(`^${formData.officerId}$`, 'i') },
    ],
  });
  if (existing) {
    throw new Error("Username, email, or officer ID already exists");
  }

  const hashedPassword = await bcrypt.hash(formData.password, 10);

  await User.create({
    fullName: formData.fullName,
    email: formData.email.toLowerCase(),
    username: formData.username.toLowerCase(),
    password: hashedPassword,
    role: formData.role || "OFFICER",
    officerId: formData.officerId.toLowerCase(),
    policeStation: formData.policeStation,
    status: "ACTIVE",
  });

  return { created: true };
});
