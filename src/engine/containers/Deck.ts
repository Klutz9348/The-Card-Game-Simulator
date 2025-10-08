import { Card, isCard } from "../objects/Card";
import { Container } from "./Container";

type Position = "top" | "bottom" | number;

export class Deck extends Container<Card> {
  constructor(cards?: Card[]) {
    super(cards);
  }

  shuffle(random: () => number = Math.random): void {
    for (let i = this.items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
  }

  draw(): Card | undefined;
  draw(count: number): Card[];
  draw(count = 1): Card | Card[] | undefined {
    if (count <= 0) {
      return [] as Card[];
    }

    if (count === 1) {
      return this.extract("top");
    }

    const results: Card[] = [];
    for (let i = 0; i < count; i += 1) {
      const card = this.extract("top");
      if (!card) {
        break;
      }
      results.push(card);
    }
    return results;
  }

  put(card: Card | Card[], position: Position = "top"): void {
    const cards = Array.isArray(card) ? card : [card];
    cards.forEach((entry, index) => {
      if (!isCard(entry)) {
        throw new TypeError("Deck can only contain cards");
      }
      const insertPosition = typeof position === "number" ? position + index : position;
      this.insert(entry, insertPosition);
    });
  }

  split(predicate: number | ((card: Card, index: number) => boolean)): [Deck, Deck] {
    const original = this.toArray();
    this.items.length = 0;

    if (typeof predicate === "number") {
      const pivot = Math.max(0, Math.min(original.length, predicate));
      const left = original.slice(0, pivot);
      const right = original.slice(pivot);
      return [Deck.fromArray(left), Deck.fromArray(right)];
    }

    const left: Card[] = [];
    const right: Card[] = [];
    original.forEach((card, index) => {
      if (predicate(card, index)) {
        left.push(card);
      } else {
        right.push(card);
      }
    });
    return [Deck.fromArray(left), Deck.fromArray(right)];
  }
}

export function isDeck(value: unknown): value is Deck {
  return value instanceof Deck;
}

export namespace Deck {
  export function fromArray(cards: Card[]): Deck {
    const deck = new Deck();
    cards.forEach((card) => deck.put(card, "bottom"));
    return deck;
  }
}
