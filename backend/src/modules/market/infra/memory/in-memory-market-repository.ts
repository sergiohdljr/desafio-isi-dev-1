import { Money } from '../../../../shared/domain/money.js';
import {
  type PurchaseFacts,
  type PurchaseWrite,
} from '../../application/policies/decide-purchase.js';
import {
  type SaleContract,
  type SaleFacts,
  type SaleWrite,
} from '../../application/policies/decide-sale.js';
import {
  type MarketRepository,
  type PurchaseReceipt,
  type SaleReceipt,
  type StoredTransaction,
  type TransactionFilter,
} from '../../application/repositories/market-repository.js';

export type MemoryMarketPlayer = {
  id: number;
  name: string;
  clubId: number | null;
  marketValue: Money;
  active?: boolean;
  contract?: SaleContract | null;
};

export type MemoryMarketClub = {
  id: number;
  cash: Money;
};

export class InMemoryMarketRepository implements MarketRepository {
  readonly writes: Array<PurchaseWrite | SaleWrite> = [];
  private nextId = 1;

  constructor(
    private readonly players: MemoryMarketPlayer[] = [],
    private readonly clubs: MemoryMarketClub[] = [],
    private readonly transactions: StoredTransaction[] = [],
  ) {
    this.nextId =
      transactions.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }

  async purchase(
    playerId: number,
    clubId: number,
    settle: (facts: PurchaseFacts) => PurchaseWrite,
  ): Promise<PurchaseReceipt> {
    const player = this.activePlayer(playerId);
    const club = this.clubs.find((item) => item.id === clubId) ?? null;
    const write = settle({
      player: player
        ? {
            id: player.id,
            name: player.name,
            clubId: player.clubId,
            marketValue: player.marketValue,
          }
        : null,
      club: club
        ? {
            id: club.id,
            cash: club.cash,
            squadSize: this.players.filter(
              (item) => item.clubId === club.id && item.active !== false,
            ).length,
          }
        : null,
      previouslySoldByClub: this.transactions.some(
        (row) =>
          row.clubId === clubId && row.playerId === playerId && row.type === 'VENDA',
      ),
    });
    if (!player || !club) {
      throw new Error('Compra sem clube ou jogador');
    }
    club.cash = Money.fromCents(club.cash.cents + write.cashChange.cents);
    player.clubId = club.id;
    const row = this.record({
      clubId,
      playerId,
      playerName: write.playerName,
      type: 'COMPRA',
      value: write.value,
      fee: write.fee,
      penalty: Money.fromCents(0),
      profit: null,
      cashChange: write.cashChange,
      createdAt: write.at,
    });
    this.writes.push(write);
    return {
      id: row.id,
      clubId,
      playerId,
      playerName: write.playerName,
      value: write.value,
      fee: write.fee,
      cashChange: write.cashChange,
      createdAt: write.at,
      loyaltyUntil: write.loyaltyUntil,
      clubCash: club.cash,
    };
  }

  async sale(
    playerId: number,
    settle: (facts: SaleFacts) => SaleWrite,
  ): Promise<SaleReceipt> {
    const player = this.activePlayer(playerId);
    const club = player?.clubId
      ? (this.clubs.find((item) => item.id === player.clubId) ?? null)
      : null;
    const write = settle({
      player: player
        ? {
            id: player.id,
            name: player.name,
            clubId: player.clubId,
            marketValue: player.marketValue,
          }
        : null,
      clubCash: club?.cash ?? null,
      contract: player?.contract ?? null,
    });
    if (!player || !club) {
      throw new Error('Venda sem clube ou jogador');
    }
    club.cash = Money.fromCents(club.cash.cents + write.cashChange.cents);
    player.clubId = null;
    player.contract = null;
    const row = this.record({
      clubId: write.clubId,
      playerId,
      playerName: write.playerName,
      type: 'VENDA',
      value: write.value,
      fee: write.fee,
      penalty: write.penalty,
      profit: write.profit,
      cashChange: write.cashChange,
      createdAt: write.at,
    });
    this.writes.push(write);
    return {
      id: row.id,
      clubId: write.clubId,
      playerId,
      playerName: write.playerName,
      value: write.value,
      fee: write.fee,
      penalty: write.penalty,
      profit: write.profit,
      cashChange: write.cashChange,
      createdAt: write.at,
      purchaseValue: write.purchaseValue,
      remainingDays: write.remainingDays,
      penaltyRate: write.penaltyRate,
      contractStatus: write.contractStatus,
      clubCash: club.cash,
    };
  }

  async list(
    clubId: number,
    filter: TransactionFilter,
  ): Promise<StoredTransaction[]> {
    return this.transactions.filter((row) => {
      if (row.clubId !== clubId) {
        return false;
      }
      if (filter.types && !filter.types.includes(row.type)) {
        return false;
      }
      if (filter.playerId !== undefined && row.playerId !== filter.playerId) {
        return false;
      }
      return true;
    });
  }

  private activePlayer(id: number): MemoryMarketPlayer | null {
    return (
      this.players.find((player) => player.id === id && player.active !== false) ??
      null
    );
  }

  private record(
    row: Omit<StoredTransaction, 'id'>,
  ): StoredTransaction {
    const stored = { id: this.nextId, ...row };
    this.nextId += 1;
    this.transactions.push(stored);
    return stored;
  }
}
