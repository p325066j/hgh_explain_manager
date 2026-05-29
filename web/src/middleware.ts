import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isStaffAuthenticated } from "@/lib/staff-auth";

const PUBLIC_PATHS = ["/staff/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isStaffPath = pathname.startsWith("/staff");
  const isApiPath = pathname.startsWith("/api");

  if (!isStaffPath && !isApiPath) {
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (await isStaffAuthenticated(req)) {
    return NextResponse.next();
  }

  if (isApiPath) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/staff/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/staff/:path*", "/api/:path*"],
};
