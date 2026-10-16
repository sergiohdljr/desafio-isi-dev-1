import { describe, expect, it } from "vitest"
import { NAME_TAKEN } from "@/features/clubs/consts/club-draft"
import { clubErrorDescription, fieldForClubError } from "@/features/clubs/utils/club-error"

describe("fieldForClubError", () => {
  it("mapeia mensagem para o campo", () => {
    expect(fieldForClubError("Sigla inválida")).toBe("acronym")
    expect(fieldForClubError("Nome inválido")).toBe("name")
    expect(fieldForClubError("Nome de clube já cadastrado")).toBe("name")
    expect(fieldForClubError("Erro genérico")).toBeNull()
  })
})

describe("clubErrorDescription", () => {
  it("detalha nome duplicado", () => {
    expect(clubErrorDescription(NAME_TAKEN, "  Real   Madrid  ")).toBe("Já existe um clube com o nome “Real Madrid”.")
  })

  it("repassa outras mensagens", () => {
    expect(clubErrorDescription("Sigla inválida", "Real Madrid")).toBe("Sigla inválida")
  })
})
