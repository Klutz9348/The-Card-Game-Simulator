import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { RuleEngine } from "../src/engine/rules/RuleEngine";

interface Payload {
  type: string;
  amount: number;
}

describe("RuleEngine", () => {
  it("registers and executes rule actions from JSON", async () => {
    const engine = new RuleEngine();
    const events: string[] = [];

    engine.registerAction("log", (payload: Payload) => {
      events.push(`${payload.type}:${payload.amount}`);
    });

    engine.loadRules({
      events: {
        "resource.gain": [
          { action: "log", condition: { type: "gold" } },
          { action: "log", condition: { type: "wood" }, once: true },
        ],
      },
    });

    await engine.emit<Payload>("resource.gain", { type: "gold", amount: 2 });
    await engine.emit<Payload>("resource.gain", { type: "wood", amount: 1 });
    await engine.emit<Payload>("resource.gain", { type: "gold", amount: 3 });

    assert.deepEqual(events, ["gold:2", "wood:1", "gold:3"]);
  });

  it("supports manual event handlers", async () => {
    const engine = new RuleEngine();
    let triggered = 0;

    engine.on("card.draw", () => {
      triggered += 1;
    });

    await engine.emit("card.draw", { id: "1" });
    await engine.emit("card.draw", { id: "2" });

    assert.equal(triggered, 2);
  });
});
