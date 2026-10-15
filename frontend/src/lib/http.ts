import axios, { isAxiosError } from "axios"

const API_PREFIX = "/api/v1"

class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const api = axios.create({
  baseURL: API_PREFIX,
  headers: { Accept: "application/json" },
})

api.interceptors.response.use(
  (response) => {
    if (response.status === 204) response.data = undefined
    return response
  },
  (error: unknown) => {
    if (!isAxiosError(error)) throw error
    throw new ApiError(errorMessage(error.response?.data), error.response?.status ?? 0)
  },
)

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
