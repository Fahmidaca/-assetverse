import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const HR_PATHS = ["/hr"];
const EMPLOYEE_PATHS = ["/employee"];
const ADMIN_PATHS = ["/admin"];
const PROTECTED_PATHS = [...HR_PATHS, ...EMPLOYEE_PATHS, ...ADMIN_PATHS];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("av_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = verifyToken(token);
  if (!user) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("av_token");
    return res;
  }

  // Role-based protection
  if (pathname.startsWith("/hr") && user.role !== "hr") {
    return NextResponse.redirect(new URL("/employee", req.url));
  }
  if (pathname.startsWith("/employee") && user.role !== "employee") {
    return NextResponse.redirect(new URL("/hr", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hr/:path*", "/employee/:path*", "/admin/:path*"],
};
