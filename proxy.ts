import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/server/cookie-names";

// Only checks that a session cookie exists on protected routes (spec section 7).
// Each page still checks, on the server, whether the session's phone has the right role.
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = new URL("/entrar", request.url);
  url.searchParams.set("voltar", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/painel/:path*", "/s/:path*"] };
