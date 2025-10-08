import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Card } from "../src/engine/objects/Card";
import { Zone } from "../src/engine/zones/Zone";
import { HandZone } from "../src/engine/zones/HandZone";
import { HiddenZone } from "../src/engine/zones/HiddenZone";
import { RandomizeZone } from "../src/engine/zones/RandomizeZone";
import { LayoutZone } from "../src/engine/zones/LayoutZone";

describe("Zones", () => {
  it("tracks containment and capacity", () => {
    const zone = new Zone<Card>("discard", { capacity: 1 });
    const card = new Card({ name: "Test" });
    zone.add(card);

    assert.equal(zone.contains(card), true);
    assert.throws(() => zone.add(new Card({ name: "Overflow" })), /capacity/);
  });

  it("lays out cards along a grid", () => {
    const layout = new LayoutZone<Card>("table", { columns: 2, spacing: { x: 2, y: 3 } });
    const cards = [new Card({ name: "A" }), new Card({ name: "B" }), new Card({ name: "C" })];
    cards.forEach((card) => layout.add(card));

    const positions = cards.map((card) => card.getState().position);
    assert.deepEqual(positions, [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 3 },
    ]);
  });

  it("reveals cards in hand zones", () => {
    const hand = new HandZone<Card>("player-hand", { revealOnEnter: true });
    const card = new Card({ name: "Hidden" });
    card.setFaceUp(false);
    hand.add(card);

    assert.equal(card.isFaceUp(), true);
  });

  it("hides cards in hidden zones and restores state", () => {
    const hidden = new HiddenZone<Card>("deck");
    const card = new Card({ name: "Secret" });
    hidden.add(card);
    assert.equal(card.isFaceUp(), false);

    hidden.remove(card);
    assert.equal(card.isFaceUp(), true);
  });

  it("randomizes order on enter", () => {
    let calls = 0;
    const random = () => {
      calls += 1;
      return 0;
    };
    const randomZone = new RandomizeZone<Card>("pile", { random });
    const cards = [new Card({ name: "A" }), new Card({ name: "B" }), new Card({ name: "C" })];
    cards.forEach((card) => randomZone.add(card));

    const order = randomZone.getObjects().map((card) => card.getName());
    assert.equal(calls > 0, true);
    assert.deepEqual(order, ["A", "C", "B"]);
  });
});
