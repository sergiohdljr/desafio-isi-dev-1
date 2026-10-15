import { describe, expect, it } from "vitest"
import { INVALID_ACRONYM, INVALID_NAME } from "@/features/clubs/consts/club-draft"
import { acronymFitsName, isClubName, validateClubDraft } from "@/features/clubs/utils/validate-club-draft"

describe("isClubName", () => {
  it("aceita nome válido", () => {
    expect(isClubName("Real Madrid")).toBe(true)
    expect(isClubName("São Paulo F.C")).toBe(true)
  })

  it("rejeita tamanho fora da faixa", () => {
    expect(isClubName("AB")).toBe(false)
    expect(isClubName("A".repeat(61))).toBe(false)
  })

  it("rejeita quantidade inválida de palavras", () => {
    expect(isClubName("Unico")).toBe(false)
    expect(isClubName("Um Dois Tres Quatro Cinco Seis")).toBe(false)
  })

  it("rejeita caracteres não permitidos", () => {
    expect(isClubName("Real Madrid!")).toBe(false)
    expect(isClubName("Real Madrid1")).toBe(false)
  })
})

describe("acronymFitsName", () => {
  it("aceita sigla formada pelas letras do nome", () => {
    expect(acronymFitsName("Real Madrid", "RMD")).toBe(true)
    expect(acronymFitsName("São Paulo", "SPO")).toBe(true)
  })

  it("rejeita sigla inválida", () => {
    expect(acronymFitsName("Real Madrid", "rmd")).toBe(false)
    expect(acronymFitsName("Real Madrid", "AAA")).toBe(false)
    expect(acronymFitsName("Real Madrid", "XRD")).toBe(false)
    expect(acronymFitsName("Real Madrid", "RM")).toBe(false)
  })
})

describe("validateClubDraft", () => {
  it("retorna null para rascunho válido", () => {
    expect(validateClubDraft({ name: "  Real   Madrid  ", acronym: " rmd " })).toBeNull()
  })

  it("aponta nome inválido", () => {
    expect(validateClubDraft({ name: "Unico", acronym: "UNI" })).toEqual({
      field: "name",
      message: INVALID_NAME,
    })
  })

  it("aponta sigla inválida", () => {
    expect(validateClubDraft({ name: "Real Madrid", acronym: "XXX" })).toEqual({
      field: "acronym",
      message: INVALID_ACRONYM,
    })
  })
})
