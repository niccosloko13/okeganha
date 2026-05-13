import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { ADMIN_IMPERSONATION_COOKIE, verifyAdminImpersonationToken } from "@/lib/admin-impersonation-token";
import { COMPANY_SESSION_COOKIE, verifyCompanySession } from "@/lib/company-session";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const BLOCKED_ACCOUNT_COOKIE = "okg_blocked_account";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isEmpresaArea = pathname.startsWith("/empresa");
  const isRelaArea = pathname.startsWith("/rela");
  const isUsuarioArea = pathname.startsWith("/usuario");

  if (isUsuarioArea && request.cookies.get(BLOCKED_ACCOUNT_COOKIE)?.value === "1") {
    const response = NextResponse.redirect(new URL("/conta/bloqueada", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (isEmpresaArea) {
    if (pathname === "/empresa/login" || pathname === "/empresa/acesso") {
      return NextResponse.next();
    }

    const impersonationToken = request.cookies.get(ADMIN_IMPERSONATION_COOKIE)?.value;
    if (impersonationToken) {
      const impersonation = await verifyAdminImpersonationToken(impersonationToken);
      if (impersonation) {
        const adminSessionToken = request.cookies.get(SESSION_COOKIE)?.value;
        if (adminSessionToken) {
          const adminSession = await verifySession(adminSessionToken);
          if (adminSession?.userId === impersonation.adminId) return NextResponse.next();
        }
      }
    }

    const companyToken = request.cookies.get(COMPANY_SESSION_COOKIE)?.value;
    if (companyToken) {
      const companySession = await verifyCompanySession(companyToken);
      if (companySession) return NextResponse.next();
    }

    const response = NextResponse.redirect(new URL("/empresa/login", request.url));
    if (companyToken) response.cookies.delete(COMPANY_SESSION_COOKIE);
    return response;
  }

  if (isRelaArea) {
    const isPublicRelaRoute = pathname === "/rela" || pathname === "/rela/login" || pathname === "/rela/cadastro";
    if (isPublicRelaRoute) return NextResponse.next();

    const companyToken = request.cookies.get(COMPANY_SESSION_COOKIE)?.value;
    if (companyToken) {
      const companySession = await verifyCompanySession(companyToken);
      if (companySession) return NextResponse.next();
    }

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const session = await verifySession(token);
      if (session) return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/rela/login", request.url));
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasInvalidCustomSession = Boolean(token);

  if (token) {
    const session = await verifySession(token);
    if (session) return NextResponse.next();
  }

  let authToken: { email?: string | null } | null = null;
  try {
    authToken = await getToken({ req: request, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });
  } catch {
    authToken = null;
  }

  if (authToken?.email) {
    const response = NextResponse.next();
    if (hasInvalidCustomSession) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  if (hasInvalidCustomSession) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export const config = {
  matcher: ["/usuario/:path*", "/admin/:path*", "/empresa/:path*", "/rela/:path*"],
};
