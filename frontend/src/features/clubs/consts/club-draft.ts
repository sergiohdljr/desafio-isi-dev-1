const NAME_MIN_LENGTH = 3
const NAME_MAX_LENGTH = 60
const NAME_MIN_WORDS = 2
const NAME_MAX_WORDS = 5
const ACRONYM_LENGTH = 3
const STARTING_CASH = 300

const INVALID_NAME = "Nome inválido"
const INVALID_ACRONYM = "Sigla inválida"
const NAME_TAKEN = "Nome de clube já cadastrado"
const CREATE_CLUB_ERROR_TITLE = "Não foi possível criar o clube"

const NAME_HINT =
  "De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
const ACRONYM_HINT =
  "3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
const ACRONYM_INPUT_PATTERN = /[^A-Za-z]/g

export {
  ACRONYM_HINT,
  ACRONYM_INPUT_PATTERN,
  ACRONYM_LENGTH,
  CREATE_CLUB_ERROR_TITLE,
  INVALID_ACRONYM,
  INVALID_NAME,
  NAME_HINT,
  NAME_MAX_LENGTH,
  NAME_MAX_WORDS,
  NAME_MIN_LENGTH,
  NAME_MIN_WORDS,
  NAME_TAKEN,
  STARTING_CASH,
}
