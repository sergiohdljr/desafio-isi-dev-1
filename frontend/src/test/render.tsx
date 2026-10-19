import type { ReactElement, ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderOptions } from "@testing-library/react"
import { MemoryRouter } from "react-router"

type ProvidersOptions = {
  route?: string
  queryClient?: QueryClient
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderWithProviders(
  ui: ReactElement,
  { route = "/", queryClient = createTestQueryClient(), ...options }: ProvidersOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}

export { createTestQueryClient, renderWithProviders }
