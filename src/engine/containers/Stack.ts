import { GameObject, isGameObject } from "../objects/GameObject";
import { Container } from "./Container";

type Position = "top" | "bottom" | number;

export class Stack<T extends GameObject = GameObject> extends Container<T> {
  constructor(items?: T[]) {
    super(items);
  }

  shuffle(): void {
    // Stacks are ordered structures; shuffling is a no-op by default.
  }

  draw(): T | undefined;
  draw(count: number): T[];
  draw(count = 1): T | T[] | undefined {
    if (count <= 0) {
      return [] as T[];
    }

    if (count === 1) {
      return this.extract("top");
    }

    const results: T[] = [];
    for (let i = 0; i < count; i += 1) {
      const item = this.extract("top");
      if (!item) {
        break;
      }
      results.push(item);
    }
    return results;
  }

  put(item: T | T[], position: Position = "top"): void {
    const items = Array.isArray(item) ? item : [item];
    items.forEach((entry, index) => {
      if (!isGameObject(entry)) {
        throw new TypeError("Stack can only contain game objects");
      }
      const insertPosition = typeof position === "number" ? position + index : position;
      this.insert(entry, insertPosition);
    });
  }

  split(predicate: number | ((value: T, index: number) => boolean)): [Stack<T>, Stack<T>] {
    const original = this.toArray();
    this.items.length = 0;

    if (typeof predicate === "number") {
      const pivot = Math.max(0, Math.min(original.length, predicate));
      const first = original.slice(0, pivot);
      const second = original.slice(pivot);
      return [new Stack(first), new Stack(second)];
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
    return [new Stack(first), new Stack(second)];
  }
}

export function isStack(value: unknown): value is Stack {
  return value instanceof Stack;
}
