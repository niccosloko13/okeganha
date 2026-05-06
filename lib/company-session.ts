import { jwtVerify, SignJWT } from "jose";

import { getRequiredSessionSecret } from "@/lib/env";

const COMPANY_SESSION_COOKIE = "okg_company_session";
const COMPANY_SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = getRequiredSessionSecret();
  return new TextEncoder().encode(`${secret}-company`);
}

export type CompanySessionPayload = {
  companyId: string;
  email: string;
};

export async function signCompanySession(payload: CompanySessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COMPANY_SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyCompanySession(token: string): Promise<CompanySessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.companyId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { companyId: payload.companyId, email: payload.email };
  } catch {
    return null;
  }
}

export { COMPANY_SESSION_COOKIE, COMPANY_SESSION_DURATION_SECONDS };
