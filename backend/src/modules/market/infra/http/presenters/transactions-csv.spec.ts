import { toTransactionsCsv } from './transactions-csv.js';
import type { TransactionView } from '../../../application/use-cases/list-transactions.use-case.js';

function row(overrides: Partial<TransactionView>): TransactionView {
  return {
    id: 1,
    clubId: 1,
    playerId: 1,
    playerName: 'Meia Lua',
    type: 'COMPRA',
    value: 37,
    fee: 1.85,
    penalty: 0,
    profit: null,
    cashChange: -38.85,
    createdAt: new Date('2026-11-02T13:15:00.000Z'),
    ...overrides,
  };
}

describe('transactions csv', () => {
  it('writes the Meia Lua sale above the purchase, with an empty profit', () => {
    const csv = toTransactionsCsv([
      row({
        type: 'VENDA',
        value: 40,
        fee: 0.3,
        penalty: 4,
        profit: 3,
        cashChange: 35.7,
        createdAt: new Date('2026-11-05T19:40:00.000Z'),
      }),
      row({}),
    ]);

    expect(csv).toBe(
      [
        'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa',
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70',
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85',
        '',
      ].join('\n'),
    );
  });

  it('quotes a name that contains a semicolon or a quote', () => {
    const csv = toTransactionsCsv([
      row({ playerName: 'Zé "Foguete" Lima' }),
      row({ playerName: 'Ana; Lima' }),
    ]);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('"Zé ""Foguete"" Lima"');
    expect(lines[2]).toContain('"Ana; Lima"');
  });

  it('keeps only the header when there are no transactions', () => {
    expect(toTransactionsCsv([])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });
});
