export type AuthUser = {
  id: string
  email: string
  full_name: string
  role: string
}

/**
 * Mirrors the backend `TokenResponse` (snake_case JSON). The API returns only
 * tokens — the `user` is derived client-side from the JWT + sign-in inputs.
 */
export type TokenData = {
  access_token: string
  refresh_token: string
  token_type: string
  user?: AuthUser
}

export type RegisterInput = {
  full_name: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

/** Standard backend envelope (`pkg/response.APIResponse`). */
export type ApiEnvelope<T> = {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string>
  }
}
