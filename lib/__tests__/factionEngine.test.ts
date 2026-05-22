import { test, describe } from "node:test";
import assert from "node:assert";
import {
  emptyWorld,
  runTick,
  runTicks,
  relKey,
  setRelationship,
  getRelationship,
  type Faction,
  type Territory,
} from "../factionEngine.js";

function mkFaction(over: Partial<Faction>): Faction {
  return {
    id: "f1", name: "Faction", archetype: "",
    aggression: 5, reach: 3, wealth: 3, influence: 5, goals: [],
    ...over,
  };
}
function mkTerritory(over: Partial<Territory>): Territory {
  return { id: "t1", name: "Land", controllerId: null, value: 2, neighbors: [], ...over };
}

describe("factionEngine", () => {
  describe("relKey", () => {
    test("canonical ordering regardless of arg order", () => {
      assert.strictEqual(relKey("b", "a"), relKey("a", "b"));
    });
  });

  describe("set/getRelationship", () => {
    test("round-trip preserves stance", () => {
      let map = {};
      map = setRelationship(map, "a", "b", { stance: 5, note: "ally" });
      assert.deepStrictEqual(getRelationship(map, "b", "a"), { stance: 5, note: "ally" });
    });
    test("self-relationship is ignored", () => {
      const map = setRelationship({}, "a", "a", { stance: 5 });
      assert.deepStrictEqual(map, {});
    });
    test("default stance is 0", () => {
      assert.deepStrictEqual(getRelationship({}, "a", "b"), { stance: 0 });
    });
  });

  describe("runTick", () => {
    test("increments tick", () => {
      const w = emptyWorld();
      const next = runTick(w, "seed");
      assert.strictEqual(next.tick, 1);
    });
    test("is deterministic for a given seed", () => {
      const w: typeof emptyWorld extends () => infer R ? R : never = {
        ...emptyWorld(),
        factions: [
          mkFaction({ id: "a", name: "A", aggression: 7 }),
          mkFaction({ id: "b", name: "B", aggression: 4 }),
        ],
        territories: [
          mkTerritory({ id: "t1", name: "T1", controllerId: "a" }),
          mkTerritory({ id: "t2", name: "T2", controllerId: "b", neighbors: ["t1"] }),
        ],
      };
      // Make adjacency symmetric.
      w.territories[0].neighbors = ["t2"];
      const a = runTicks(w, 5, "campaign-x");
      const b = runTicks(w, 5, "campaign-x");
      assert.strictEqual(a.tick, 5);
      assert.strictEqual(b.tick, 5);
      assert.deepStrictEqual(
        a.factions.map(f => ({ id: f.id, infl: f.influence, reach: f.reach, wealth: f.wealth })),
        b.factions.map(f => ({ id: f.id, infl: f.influence, reach: f.reach, wealth: f.wealth })),
      );
      assert.deepStrictEqual(a.log.length, b.log.length);
    });
    test("different seeds produce different histories", () => {
      const w = {
        ...emptyWorld(),
        factions: [
          mkFaction({ id: "a", name: "A" }),
          mkFaction({ id: "b", name: "B" }),
        ],
      };
      const a = runTicks(w, 5, "seed-1");
      const b = runTicks(w, 5, "seed-2");
      // At least one event should differ.
      const sa = a.log.map(e => e.summary).join("|");
      const sb = b.log.map(e => e.summary).join("|");
      assert.notStrictEqual(sa, sb);
    });
    test("influence stays in [0, 30]", () => {
      const w = {
        ...emptyWorld(),
        factions: [mkFaction({ id: "a", name: "A", influence: 28, wealth: 10 })],
      };
      const after = runTicks(w, 20, "seed");
      assert.ok(after.factions[0].influence >= 0);
      assert.ok(after.factions[0].influence <= 30);
    });
  });
});
