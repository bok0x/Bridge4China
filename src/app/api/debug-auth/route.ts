import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map((c) => c.name);
  const authCookies = allCookies.filter((c) => c.name.startsWith("sb-"));

  return NextResponse.json({
    totalCookies: allCookies.length,
    cookieNames,
    authCookies: authCookies.map((c) => ({ name: c.name, valueLength: c.value.length })),
    hasAuthCookie: authCookies.length > 0,
  });
}
