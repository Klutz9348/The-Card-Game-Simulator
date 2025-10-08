import { describe, it } from "vitest";
import assert from "node:assert/strict";

import { Card } from "../src/engine/objects/Card";
import { Dice } from "../src/engine/objects/Dice";
import { Tile } from "../src/engine/objects/Tile";

describe("Game objects", () => {
  it("clones cards with metadata", () => {
    const card = new Card({ name: "Ace of Spades", suit: "spades", rank: "A" });
    card.addTag("special");
    card.moveTo({ x: 5, y: 10 });
    const clone = card.clone();

    assert.notStrictEqual(clone, card);
    assert.equal(clone.getId(), card.getId());
    assert.equal(clone.getName(), "Ace of Spades");
    assert.deepEqual(clone.getTags(), ["special"]);
    assert.deepEqual(clone.getState().position, { x: 5, y: 10 });
  });

  it("rolls dice with predictable randomness", () => {
    const dice = new Dice({ name: "d6", sides: 6, value: 1 });
    const randomSequence = [0.1, 0.9];
    let index = 0;
    const random = () => randomSequence[index++ % randomSequence.length];

    const first = dice.roll(random);
    const second = dice.roll(random);

    assert.equal(first, 1);
    assert.equal(second, 6);
  });

  it("rotates tiles in 90 degree increments", () => {
    const tile = new Tile({ name: "Path", kind: "path" });
    tile.rotateClockwise(2);

    assert.equal(tile.rotation, 180);
  });
});
