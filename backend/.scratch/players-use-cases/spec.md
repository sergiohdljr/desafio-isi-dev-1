# Casos de uso e portas do jogador

Recorte aprovado: só o módulo de jogadores. Os casos de uso ficam todos numa pasta. A persistência entra por uma interface de repositório, implementada só pelo adaptador. O controller chama uma interface por operação e não a classe concreta.

A fronteira é parcial: o caso de uso devolve um modelo de resposta e um presenter monta o JSON. Sem presenter por callback. O contrato HTTP de jogadores permanece o mesmo.
