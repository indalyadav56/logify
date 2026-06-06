import type {
  ApiEnvelope,
  LoginInput,
  RegisterInput,
  TokenData,
} from "./types"

/** Base URL without trailing slash (`NEXT_PUBLIC_LOGIFY_API_*` is inlined in the client bundle). */
function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LOGIFY_API_BASE_URL ?? "http://127.0.0.1:8080"
  ).replace(/\/$/, "")
}

/** POST JSON to an auth endpoint and unwrap the `{ success, data, error }` envelope. */
async function postAuth<T>(path: string, body: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(
      "Can't reach the Logify API. Check your connection and try again."
    )
  }

  const text = await res.text()
  let parsed: ApiEnvelope<T>
  try {
    parsed = JSON.parse(text) as ApiEnvelope<T>
  } catch {
    throw new Error(`Unexpected response from the server (${res.status}).`)
  }

  if (!res.ok || !parsed.success) {
    throw new Error(
      parsed.error?.message ??
        parsed.message ??
        `Request failed (${res.status}).`
    )
  }

  if (!parsed.data) {
    throw new Error("The server returned an incomplete response.")
  }

  return parsed.data
}

/** Register a new tenant + admin user. Returns access/refresh tokens. */
export function registerUser(input: RegisterInput): Promise<TokenData> {
  return postAuth<TokenData>("/v1/auth/register", input)
}

/** Authenticate with email + password. Returns access/refresh tokens. */
export function loginUser(input: LoginInput): Promise<TokenData> {
  return postAuth<TokenData>("/v1/auth/login", input)
}
