import { DomainError } from '../../../../shared/domain/domain-error.js';
import { Money } from '../../../../shared/domain/money.js';
import { Player } from './player.js';

const meia = {
  name: 'Meia Lua',
  position: 'MEI' as const,
  agility: 85,
  age: 25,
  pace: 68,
  shooting: 65,
  passing: 80,
  dribbling: 78,
  defending: 52,
  physical: 60,
  potential: 86,
};

describe('Player', () => {
  it('is born apto, free, and priced from the published meia attributes', () => {
    const player = Player.register(meia);

    expect(player.condition).toBe('APTO');
    expect(player.clubId).toBeNull();
    expect(player.overall).toBe(73);
    expect(player.potential).toBe(86);
  });

  it('rounds a zagueiro overall of 72.5 up to 73', () => {
    const player = Player.register({
      name: 'Zagueiro Meio',
      position: 'ZAG',
      agility: 50,
      age: 25,
      pace: 50,
      shooting: 90,
      passing: 60,
      dribbling: 40,
      defending: 80,
      physical: 75,
      potential: 90,
    });

    expect(player.overall).toBe(73);
  });

  it('prices a young promise and a high overall with the age uplift', () => {
    const young = Player.register({
      name: 'Jovem Promessa',
      position: 'MEI',
      agility: 50,
      age: 18,
      pace: 40,
      shooting: 50,
      passing: 50,
      dribbling: 40,
      defending: 40,
      physical: 40,
      potential: 90,
    });

    expect(young.overall).toBe(45);
    expect(young.baseValue.amount).toBe(3.63);
    expect(young.marketValue.amount).toBe(3.99);

    const priced = Player.register({
      name: 'Base Oitenta',
      position: 'GOL',
      agility: 50,
      age: 19,
      pace: 82,
      shooting: 1,
      passing: 82,
      dribbling: 1,
      defending: 82,
      physical: 82,
      potential: 82,
    });

    expect(priced.baseValue.amount).toBe(82);
    expect(priced.marketValue.amount).toBe(90.2);
  });

  it('uses the floor of one coin when the priced part is below it', () => {
    const player = Player.register({
      name: 'Goleiro Piso',
      position: 'GOL',
      agility: 50,
      age: 36,
      pace: 6,
      shooting: 1,
      passing: 20,
      dribbling: 1,
      defending: 66,
      physical: 30,
      potential: 66,
    });

    expect(player.overall).toBe(40);
    expect(player.baseValue.amount).toBe(1);
    expect(player.marketValue.amount).toBe(1);
  });

  it('refuses an inconsistent registration', () => {
    expect(() => Player.register({ ...meia, potential: 70 })).toThrow(
      DomainError,
    );
    expect(() =>
      Player.register({
        name: 'Veterano Potencial',
        position: 'GOL',
        agility: 50,
        age: 36,
        pace: 6,
        shooting: 1,
        passing: 20,
        dribbling: 1,
        defending: 66,
        physical: 30,
        potential: 90,
      }),
    ).toThrow(DomainError);
    expect(() =>
      Player.register({
        ...meia,
        name: 'Agilidade Alta',
        age: 35,
        agility: 86,
      }),
    ).toThrow(DomainError);
    expect(() =>
      Player.register({
        ...meia,
        name: 'Soma Alta',
        pace: 99,
        shooting: 99,
        passing: 99,
        dribbling: 99,
        defending: 99,
        physical: 99,
        potential: 99,
      }),
    ).toThrow(DomainError);
  });

  it('recalculates the market value when the condition changes and keeps the base value', () => {
    const player = Player.register({
      name: 'Base Oitenta Jovem',
      position: 'GOL',
      agility: 80,
      age: 21,
      pace: 82,
      shooting: 1,
      passing: 82,
      dribbling: 1,
      defending: 82,
      physical: 82,
      potential: 82,
    });

    expect(player.baseValue.amount).toBe(82);
    player.changeCondition('MAL_CONDICIONADO');
    expect(player.condition).toBe('MAL_CONDICIONADO');
    expect(player.marketValue.amount).toBe(84.05);
    expect(player.baseValue.amount).toBe(82);
  });

  it('applies the sick discount cap, the halved discount, and the market floor', () => {
    const sick = Player.register({
      name: 'Base Oitenta Doente',
      position: 'GOL',
      agility: 10,
      age: 40,
      pace: 82,
      shooting: 1,
      passing: 82,
      dribbling: 1,
      defending: 82,
      physical: 82,
      potential: 82,
    });
    sick.changeCondition('DOENTE');
    expect(sick.marketValue.amount).toBe(49.2);

    const halved = Player.register({
      name: 'Meia Nove',
      position: 'MEI',
      agility: 85,
      age: 25,
      pace: 59,
      shooting: 59,
      passing: 59,
      dribbling: 59,
      defending: 59,
      physical: 59,
      potential: 59,
    });
    expect(halved.baseValue.amount).toBe(9.5);
    expect(halved.overall).toBe(59);
    halved.changeCondition('MAL_CONDICIONADO');
    expect(halved.marketValue.amount).toBe(8.79);

    const floored = Player.register({
      name: 'Goleiro Piso Condicao',
      position: 'GOL',
      agility: 50,
      age: 35,
      pace: 6,
      shooting: 1,
      passing: 20,
      dribbling: 1,
      defending: 66,
      physical: 30,
      potential: 66,
    });
    floored.changeCondition('MAL_CONDICIONADO');
    expect(floored.marketValue.amount).toBe(1);
  });

  it('keeps the same condition without changing the player', () => {
    const player = Player.register(meia);
    const market = player.marketValue.amount;

    player.changeCondition('APTO');

    expect(player.condition).toBe('APTO');
    expect(player.marketValue.amount).toBe(market);
  });

  it('refuses to jump from sick straight to apto', () => {
    const player = Player.register({ ...meia, name: 'Esta Doente' });
    player.changeCondition('MAL_CONDICIONADO');
    player.changeCondition('DOENTE');

    expect(() => player.changeCondition('APTO')).toThrow(DomainError);
    expect(player.condition).toBe('DOENTE');
  });

  it('revises profile fields and reprices from the same base value', () => {
    const player = Player.register({ ...meia, name: 'Meia Original', age: 19 });

    expect(player.baseValue.amount).toBe(40.68);
    expect(player.overall).toBe(73);
    expect(player.marketValue.amount).toBe(44.75);

    player.revise({
      name: 'Ataque Novo',
      position: 'ATA',
      agility: 40,
      age: 32,
    });

    expect(player.name).toBe('Ataque Novo');
    expect(player.position).toBe('ATA');
    expect(player.agility).toBe(40);
    expect(player.age).toBe(32);
    expect(player.potential).toBe(86);
    expect(player.baseValue.amount).toBe(40.68);
    expect(player.overall).toBe(69);
    expect(player.marketValue.amount).toBe(36.61);
  });

  it('keeps the registered potential when the age reaches 33', () => {
    const player = Player.register({ ...meia, name: 'Potencial Fixo' });

    player.revise({
      name: 'Potencial Fixo',
      position: 'MEI',
      agility: 85,
      age: 33,
    });

    expect(player.age).toBe(33);
    expect(player.potential).toBe(86);
  });

  it('refuses a lower age, a position change while in a club, and agility above 85 from 35', () => {
    const player = Player.register({ ...meia, name: 'Idade Clube' });

    expect(() =>
      player.revise({
        name: 'Idade Clube',
        position: 'MEI',
        agility: 85,
        age: 24,
      }),
    ).toThrow(DomainError);
    expect(player.age).toBe(25);

    const hired = Player.reconstitute({
      id: 1,
      name: player.name,
      position: player.position,
      agility: player.agility,
      age: player.age,
      condition: player.condition,
      baseValue: player.baseValue,
      pace: player.pace,
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defending: player.defending,
      physical: player.physical,
      potential: player.potential,
      clubId: 7,
      excluded: false,
    });
    expect(() =>
      hired.revise({
        name: 'Idade Clube',
        position: 'ATA',
        agility: 85,
        age: 25,
      }),
    ).toThrow(DomainError);
    expect(hired.position).toBe('MEI');
    expect(hired.clubId).toBe(7);

    expect(() =>
      player.revise({
        name: 'Edicao Invalida',
        position: 'MEI',
        agility: 86,
        age: 35,
      }),
    ).toThrow(DomainError);
    expect(player.agility).toBe(85);
  });

  it('refuses to exclude a player who belongs to a club', () => {
    const player = Player.reconstitute({
      id: 2,
      name: 'No Elenco',
      position: 'MEI',
      agility: 85,
      age: 25,
      condition: 'APTO',
      baseValue: Money.roundHalfAwayFromZero('1'),
      pace: 68,
      shooting: 65,
      passing: 80,
      dribbling: 78,
      defending: 52,
      physical: 60,
      potential: 86,
      clubId: 4,
      excluded: false,
    });

    expect(() => player.exclude()).toThrow(DomainError);
    expect(player.excluded).toBe(false);

    const free = Player.register({ ...meia, name: 'Livre' });
    free.exclude();
    expect(free.excluded).toBe(true);
  });
});
