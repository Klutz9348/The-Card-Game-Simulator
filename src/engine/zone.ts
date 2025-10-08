import { CardState, ZoneState } from '@/types/state';

export class Zone {
  constructor(private readonly state: ZoneState) {}

  onEnter(card: CardState): ZoneState {
    if (this.state.cards.includes(card.id)) {
      return this.state;
    }

    return {
      ...this.state,
      cards: [...this.state.cards, card.id]
    };
  }

  onLeave(card: CardState): ZoneState {
    if (!this.state.cards.includes(card.id)) {
      return this.state;
    }

    return {
      ...this.state,
      cards: this.state.cards.filter((id) => id !== card.id)
    };
  }

  contains(cardId: string): boolean {
    return this.state.cards.includes(cardId);
  }

  get snapshot(): ZoneState {
    return this.state;
  }
}
