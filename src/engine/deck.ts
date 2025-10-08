import { CardState, ZoneState } from '@/types/state';

export class Deck {
  private cards: CardState[];

  constructor(cards: CardState[]) {
    this.cards = [...cards];
  }

  static fromZone(zone: ZoneState, cardMap: Record<string, CardState>): Deck {
    const cards = zone.cards
      .map((id) => cardMap[id])
      .filter((card): card is CardState => Boolean(card));
    return new Deck(cards);
  }

  draw(): CardState | undefined {
    return this.cards.shift();
  }

  shuffle(random: () => number = Math.random): void {
    for (let i = this.cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  addToTop(card: CardState): void {
    this.cards.unshift(card);
  }

  toZone(zone: ZoneState): ZoneState {
    return {
      ...zone,
      cards: this.cards.map((card) => card.id)
    };
  }

  get snapshot(): CardState[] {
    return [...this.cards];
  }
}
