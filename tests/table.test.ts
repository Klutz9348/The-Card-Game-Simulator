import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Card } from "../src/engine/objects/Card";
import { Table } from "../src/engine/table/Table";

describe("Table", () => {
  it("snaps positions to a grid", () => {
    const table = new Table({ gridSize: 5 });
    const snapped = table.snapPosition({ x: 12, y: 13 });
    assert.deepEqual(snapped, { x: 10, y: 15 });
  });

  it("uses custom snap points when within range", () => {
    const table = new Table({ gridSize: 5, snapRadius: 3 });
    table.addSnapPoint({ id: "center", position: { x: 25, y: 25 }, radius: 4 });
    const card = new Card({ name: "Token" });
    const placed = table.place(card, { x: 26, y: 26 });

    assert.deepEqual(placed, { x: 25, y: 25 });
    assert.deepEqual(card.getState().position, { x: 25, y: 25 });
  });
});
