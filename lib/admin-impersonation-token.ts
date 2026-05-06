import { jwtVerify, SignJWT } from "jose";

import { getRequiredSessionSecret } from "@/lib/env";

export const ADMIN_IMPERSONATION_COOKIE = "okg_admin_impersonation";
const DURATION_SECONDS = 60 * 60 * 8;

export type ImpersonationPayload = {
  adminId: string;
  companyId: string;
  startedAt: string;
  logId: string;
};

function getSecretKey() {
  const secret = getRequiredSessionSecret();
  return new TextEncoder().encode(secret);
}

export async function signAdminImpersonationToken(payload: ImpersonationPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminImpersonationToken(token: string): Promise<ImpersonationPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.adminId !== "string" ||
      typeof payload.companyId !== "string" ||
      typeof payload.startedAt !== "string" ||
      typeof payload.logId !== "string"
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      companyId: payload.companyId,
      startedAt: payload.startedAt,
      logId: payload.logId,
    };
  } catch {
    return null;
  }
}

export { DURATION_SECONDS as ADMIN_IMPERSONATION_DURATION_SECONDS };
