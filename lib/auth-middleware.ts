import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "./jwt";
import { JWTPayload } from "@/types";

export function getAuthUser(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get("authorization");
  const token = getTokenFromHeader(authHeader);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest): {
  user: JWTPayload | null;
  error: NextResponse | null;
} {
  const user = getAuthUser(req);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export function requireHR(req: NextRequest): {
  user: JWTPayload | null;
  error: NextResponse | null;
} {
  const { user, error } = requireAuth(req);
  if (error) return { user: null, error };
  if (user!.role !== "hr") {
    return {
      user: null,
      error: NextResponse.json({ error: "HR access only" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export function requireEmployee(req: NextRequest): {
  user: JWTPayload | null;
  error: NextResponse | null;
} {
  const { user, error } = requireAuth(req);
  if (error) return { user: null, error };
  if (user!.role !== "employee") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Employee access only" },
        { status: 403 }
      ),
    };
  }
  return { user, error: null };
}
