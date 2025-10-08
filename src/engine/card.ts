import { CardState } from '@/types/state';

export class Card {
  constructor(private readonly state: CardState) {}

  flip(): boolean {
    this.state.faceUp = !this.state.faceUp;
    return this.state.faceUp;
  }

  moveToZone(zoneId: string | null): void {
    this.state.zoneId = zoneId;
  }

  get snapshot(): CardState {
    return this.state;
  }
}
