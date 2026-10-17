import {
  type SquadMember,
  type SquadReader,
} from '../../application/repositories/squad-reader.js';

export class InMemorySquadReader implements SquadReader {
  constructor(private readonly members: SquadMember[] = []) {}

  async list(): Promise<SquadMember[]> {
    return this.members;
  }
}
