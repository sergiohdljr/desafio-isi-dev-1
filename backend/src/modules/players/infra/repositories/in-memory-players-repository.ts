import { Player, type RegisterPlayer } from '../../domain/entities/player.js';
import { type PlayersRepository } from '../../application/repositories/players-repository.js';

export class InMemoryPlayersRepository implements PlayersRepository {
  readonly saved: Player[] = [];
  private nextId: number;

  constructor(private readonly players: Player[] = []) {
    this.nextId =
      players.reduce((max, player) => Math.max(max, player.id), 0) + 1;
  }

  async add(player: Player): Promise<Player> {
    const stored = storedPlayer(registerInput(player), this.nextId);
    this.nextId += 1;
    this.players.push(stored);
    return stored;
  }

  async findActiveById(id: number): Promise<Player | null> {
    return (
      this.players.find((player) => player.id === id && !player.excluded) ??
      null
    );
  }

  async findActive(): Promise<Player[]> {
    return this.players.filter((player) => !player.excluded);
  }

  async save(player: Player): Promise<void> {
    this.saved.push(player);
  }
}

function registerInput(player: Player): RegisterPlayer {
  return {
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
  };
}

function storedPlayer(input: RegisterPlayer, id: number): Player {
  const draft = Player.register(input);
  return Player.reconstitute({
    id,
    name: draft.name,
    position: draft.position,
    agility: draft.agility,
    age: draft.age,
    condition: draft.condition,
    baseValue: draft.baseValue,
    pace: draft.pace,
    shooting: draft.shooting,
    passing: draft.passing,
    dribbling: draft.dribbling,
    defending: draft.defending,
    physical: draft.physical,
    potential: draft.potential,
    clubId: null,
    excluded: false,
  });
}
