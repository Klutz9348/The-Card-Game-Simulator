import { describe, it } from "vitest";
import assert from "node:assert/strict";

import { Card } from "../src/engine/objects/Card";
import { Deck } from "../src/engine/containers/Deck";
import { Bag } from "../src/engine/containers/Bag";
import { Stack } from "../src/engine/containers/Stack";

describe("Containers", () => {
  it("draws cards from the top of the deck", () => {
    const cards = [
      new Card({ name: "One" }),
      new Card({ name: "Two" }),
      new Card({ name: "Three" }),
    ];
    const deck = new Deck(cards);
    const drawn = deck.draw();
    assert.equal(drawn?.getName(), "Three");
    assert.equal(deck.size, 2);
  });

  it("splits decks by count", () => {
    const deck = new Deck([
      new Card({ name: "A" }),
      new Card({ name: "B" }),
      new Card({ name: "C" }),
      new Card({ name: "D" }),
    ]);
    const [left, right] = deck.split(2);

    assert.equal(left.size, 2);
    assert.equal(right.size, 2);
    assert.equal(left.draw()?.getName(), "D");
    assert.equal(right.draw()?.getName(), "B");
  });

  it("supports random draws from bags", () => {
    const values = ["A", "B", "C", "D"];
    const bag = new Bag(values.map((name) => new Card({ name })));
    const drawn = bag.draw(2) as Card[];

    assert.equal(drawn.length, 2);
    assert.equal(bag.size, 2);
  });

  it("treats stacks as LIFO structures", () => {
    const stack = new Stack<Card>();
    stack.put(new Card({ name: "Bottom" }), "bottom");
    stack.put(new Card({ name: "Top" }));

    const top = stack.draw();
    assert.equal(top?.getName(), "Top");
  });
});
