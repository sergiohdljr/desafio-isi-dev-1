import { formatBrasilia } from '../../../../clubs/infra/http/presenters/brasilia-time.js';
import { TransactionView } from '../../../application/use-cases/list-transactions.use-case.js';

const HEADER =
  'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa';

export function toTransactionsCsv(rows: TransactionView[]): string {
  const lines = rows.map(
    (row) =>
      [
        formatBrasilia(row.createdAt),
        row.type,
        csvText(row.playerName),
        csvAmount(row.value),
        csvAmount(row.fee),
        csvAmount(row.penalty),
        row.profit === null ? '' : csvAmount(row.profit),
        csvAmount(row.cashChange),
      ].join(';'),
  );
  return `${[HEADER, ...lines].join('\n')}\n`;
}

function csvText(value: string): string {
  if (!value.includes(';') && !value.includes('"')) {
    return value;
  }
  return `"${value.replaceAll('"', '""')}"`;
}

function csvAmount(amount: number): string {
  const negative = amount < 0;
  const [whole, fraction] = Math.abs(amount).toFixed(2).split('.');
  return `${negative ? '-' : ''}${whole},${fraction}`;
}
