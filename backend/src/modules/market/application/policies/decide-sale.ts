import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import {
  settleSale,
  type ContractStatus,
} from '../../domain/sale-settlement.js';

export type SalePlayer = {
  id: number;
  name: string;
  clubId: number | null;
  marketValue: Money;
};

export type SaleContract = {
  purchaseValue: Money;
  loyaltyUntil: Date;
};

export type SaleFacts = {
  player: SalePlayer | null;
  clubCash: Money | null;
  contract: SaleContract | null;
};

export type SaleWrite = {
  playerName: string;
  clubId: number;
  value: Money;
  fee: Money;
  penalty: Money;
  profit: Money;
  cashChange: Money;
  purchaseValue: Money;
  remainingDays: number;
  penaltyRate: number;
  contractStatus: ContractStatus;
  at: Date;
};

export function decideSale(facts: SaleFacts, soldAt: Date): SaleWrite {
  if (!facts.player) {
    throw new DomainError('missing', 'Jogador não encontrado');
  }
  if (facts.player.clubId === null || facts.clubCash === null) {
    throw new DomainError('conflict', 'Jogador livre não pode ser vendido');
  }
  if (!facts.contract) {
    throw new DomainError('conflict', 'Jogador sem contrato ativo');
  }

  const terms = settleSale({
    purchaseValue: facts.contract.purchaseValue,
    marketValue: facts.player.marketValue,
    loyaltyUntil: facts.contract.loyaltyUntil,
    soldAt,
  });
  return {
    playerName: facts.player.name,
    clubId: facts.player.clubId,
    value: facts.player.marketValue,
    fee: terms.commission,
    penalty: terms.penalty,
    profit: terms.profit,
    cashChange: terms.credit,
    purchaseValue: facts.contract.purchaseValue,
    remainingDays: terms.remainingDays,
    penaltyRate: terms.penaltyRate,
    contractStatus: terms.contractStatus,
    at: soldAt,
  };
}
