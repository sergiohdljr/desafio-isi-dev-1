import { afterEach, describe, expect, it, vi } from "vitest"
import { downloadBlob } from "@/features/clubs/utils/download-blob"

describe("downloadBlob", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("creates a temporary link, clicks it, and revokes the object URL", () => {
    const createObjectURL = vi.fn(() => "blob:mock")
    const revokeObjectURL = vi.fn()
    const click = vi.fn()
    const link = { href: "", download: "", click }
    const createElement = vi.fn(() => link)

    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL })
    vi.stubGlobal("document", { createElement })

    const file = new Blob(["a,b"], { type: "text/csv" })
    downloadBlob(file, "historico.csv")

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(createElement).toHaveBeenCalledWith("a")
    expect(link.href).toBe("blob:mock")
    expect(link.download).toBe("historico.csv")
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock")
  })
})
