import crypto from "node:crypto"
import type { NextRequest } from "next/server"

import { AUTH_COOKIE_OPTIONS } from "@/lib/cookies"
import { GOOGLE_CALLBACK_PATH } from "@/lib/routes"
import type { RegisterRole } from "@/types"

const AUTHORIZE_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
const SCOPES = ["openid", "email", "profile"]

export const GOOGLE_OAUTH_COOKIE = "google_oauth"

export const GOOGLE_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: AUTH_COOKIE_OPTIONS.secure,
  path: "/api/auth/google",
  maxAge: 60 * 10,
} as const

export type GoogleOAuthHandshake = {
  state: string
  verifier: string
  redirectTo: string
  role: RegisterRole
}

function base64url(bytes: Buffer) {
  return bytes.toString("base64url")
}

export function createState() {
  return base64url(crypto.randomBytes(16))
}

export function createPkcePair() {
  const verifier = base64url(crypto.randomBytes(32))
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  )
  return { verifier, challenge }
}

export function statesMatch(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function callbackUrl(request: NextRequest) {
  const origin = process.env.APP_URL || request.nextUrl.origin
  return new URL(GOOGLE_CALLBACK_PATH, origin).toString()
}

export function buildAuthorizeUrl({
  clientId,
  redirectUri,
  state,
  challenge,
}: {
  clientId: string
  redirectUri: string
  state: string
  challenge: string
}) {
  const url = new URL(AUTHORIZE_ENDPOINT)
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString()
  return url.toString()
}

export function readHandshake(
  request: NextRequest
): GoogleOAuthHandshake | null {
  const raw = request.cookies.get(GOOGLE_OAUTH_COOKIE)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<GoogleOAuthHandshake>
    if (
      typeof parsed.state !== "string" ||
      typeof parsed.verifier !== "string"
    ) {
      return null
    }
    return {
      state: parsed.state,
      verifier: parsed.verifier,
      redirectTo:
        typeof parsed.redirectTo === "string" ? parsed.redirectTo : "",
      role: parsed.role === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
    }
  } catch {
    return null
  }
}
