import { GameObject, isGameObject } from "../objects/GameObject";
import { Container } from "./Container";

type Position = "top" | "bottom" | number;

export class Bag<T extends GameObject = GameObject> extends Container<T> {
  constructor(items?: T[]) {
    super(items);
  }

  shuffle(random: () => number = Math.random): void {
    for (let i = this.items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
  }

  draw(): T | undefined;
  draw(count: number): T[];
  draw(count = 1): T | T[] | undefined {
    if (count <= 0) {
      return [] as T[];
    }

    if (this.items.length === 0) {
      return undefined;
    }

    if (count === 1) {
      const index = Math.floor(Math.random() * this.items.length);
      return this.extract(index);
    }

    const results: T[] = [];
    for (let i = 0; i < count; i += 1) {
      if (this.items.length === 0) {
        break;
      }
      const index = Math.floor(Math.random() * this.items.length);
      const item = this.extract(index);
      if (item) {
        results.push(item);
      }
    }
    return results;
  }

  put(item: T | T[], position: Position = "bottom"): void {
    const items = Array.isArray(item) ? item : [item];
    items.forEach((entry, index) => {
      if (!isGameObject(entry)) {
        throw new TypeError("Bag can only contain game objects");
      }
      const insertPosition = typeof position === "number" ? position + index : position;
      this.insert(entry, insertPosition);
    });
  }

  split(predicate: number | ((value: T, index: number) => boolean)): [Bag<T>, Bag<T>] {
    const original = this.toArray();
    this.items.length = 0;

    if (typeof predicate === "number") {
      const pivot = Math.max(0, Math.min(original.length, predicate));
      const first = original.slice(0, pivot);
      const second = original.slice(pivot);
      return [new Bag(first), new Bag(second)];
    }

    const first: T[] = [];
    const second: T[] = [];
    original.forEach((entry, index) => {
      if (predicate(entry, index)) {
        first.push(entry);
      } else {
        second.push(entry);
      }
    });
    return [new Bag(first), new Bag(second)];
  }
}

export function isBag(value: unknown): value is Bag {
  return value instanceof Bag;
}
