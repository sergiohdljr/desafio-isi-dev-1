# 01: Cadastrar e consultar um jogador

**What to build:** Alguém cadastra um jogador com nome, posição, agilidade, idade e os seis indicadores mais o potencial, e em seguida consulta esse jogador. A API calcula o valor base uma única vez no cadastro e o grava. Cada consulta calcula na hora o overall e o valor de mercado. O jogador nasce apto e sem clube. Homônimos são permitidos.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `POST /api/v1/players` com `name`, `position`, `agility`, `age`, `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical` e `potential` responde `201`, com `Content-Type: application/json` e `Location` apontando para `/api/v1/players/{id}`.
- [x] A resposta e o `GET /api/v1/players/{id}` trazem `id`, `name`, `position`, `agility`, `age`, `condition`, `base_value`, `market_value`, `pace`, `shooting`, `passing`, `dribbling`, `defending`, `physical`, `potential`, `overall` e `club_id`. No cadastro, `condition` é `APTO` e `club_id` é nulo.
- [x] O valor base segue a RN06 e fica gravado: parte progressiva do overall (nada até 40; 0,50 de 41 a 60; 2,00 de 61 a 75; 6,00 de 76 a 99); se a idade do cadastro for de até 21 anos, multiplica por (100 + potencial − overall) ÷ 100; arredonda uma vez para 2 casas, meio para longe do zero; piso 1,00. Overall 75, potencial 86 e 25 anos gravam 40,00. Overall 45, potencial 90 e 18 anos gravam 3,63. Overall 40 grava 1,00.
- [x] O overall é calculado a cada consulta e não é gravado: atributo vezes o peso da posição (os pesos de cada posição somam 100), soma dividida por 100, inteiro mais próximo com meio para cima. Meia com 68, 65, 80, 78, 52 e 60 tem overall 73. Zagueiro cuja conta dá 72,50 tem overall 73.
- [x] No jogador apto, a agilidade não altera o desconto. O valor de mercado usa a idade atual: até 21 anos, +10%; de 22 a 31, 0%; 32 ou mais, −10%. Valor base 82,00, apto, agilidade 50 e 19 anos resulta em 90,20. O piso do valor de mercado é 1,00 e o desconto total não passa de −40%.
- [x] Campo obrigatório ausente ou nulo, tipo errado (`"15"` em vez de número, fração num inteiro), valor fora do limite ou enum em outro caso (`ata`) responde `400` e não grava. `50.0` vale 50. Nome é normalizado (pontas e espaços repetidos) antes de validar e gravar; caractere de controle responde `400`.
- [x] `base_value`, `market_value`, `overall`, `condition`, `club_id` e qualquer campo desconhecido enviados no cadastro são ignorados. Potencial menor que o maior dos seis atributos é recusado. No cadastro com 33 anos ou mais, o potencial tem de ser igual a esse maior. Com 35 anos ou mais, a agilidade máxima é 85. A soma dos seis atributos não passa de 480.
- [x] `GET /api/v1/players/{id}` de jogador inexistente, ou de id que não é inteiro positivo só com dígitos e sem zero à esquerda (`abc`, `0`, `-1`, `1.5`, `01`, acima de 2147483647), responde `404` com `message` não vazio e sem stack trace.
