const API_PREFIX = "/api/v1"

class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 204) return undefined as T

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(errorMessage(body), response.status)
  }
  return body as T
}

function errorMessage(body: unknown) {
  if (!body || typeof body !== "object" || !("message" in body)) {
    return "Não foi possível concluir a ação."
  }
  const message = body.message
  if (typeof message === "string") return message
  if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
    return message.join(" ")
  }
  return "Não foi possível concluir a ação."
}

export { ApiError, api }
