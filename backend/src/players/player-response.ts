import { condicao, posicao, Prisma } from '../generated/prisma/client.js';
import { marketValueOf, overallOf } from './player-valuation.js';

export type StoredPlayer = {
  id: number;
  nome: string;
  posicao: posicao;
  agilidade: number;
  idade: number;
  valor_base: Prisma.Decimal;
  condicao: condicao;
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
  potencial: number;
  clube_id: number | null;
};

export type PlayerResponse = {
  id: number;
  name: string;
  position: posicao;
  agility: number;
  age: number;
  condition: condicao;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
};

export function toPlayerResponse(player: StoredPlayer): PlayerResponse {
  const skills = {
    pace: player.velocidade,
    shooting: player.finalizacao,
    passing: player.passe,
    dribbling: player.drible,
    defending: player.defesa,
    physical: player.fisico,
  };
  const overall = overallOf(player.posicao, skills);
  const marketValue = marketValueOf(
    new Prisma.Decimal(player.valor_base),
    player.condicao,
    player.agilidade,
    player.idade,
  );

  return {
    id: player.id,
    name: player.nome,
    position: player.posicao,
    agility: player.agilidade,
    age: player.idade,
    condition: player.condicao,
    base_value: new Prisma.Decimal(player.valor_base).toNumber(),
    market_value: marketValue.toNumber(),
    ...skills,
    potential: player.potencial,
    overall,
    club_id: player.clube_id,
  };
}
