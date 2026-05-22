import { test, describe } from "node:test";
import assert from "node:assert";
import {
  encumbrance,
  purseToCp,
  purseToGp,
  purseWeightLb,
  consolidatePurse,
  containerStatus,
  totalCarriedLb,
  CONTAINER_PRESETS,
  emptyPurse,
} from "../logistics.js";

describe("logistics", () => {
  describe("encumbrance", () => {
    test("STR 10, 40 lb = unencumbered", () => {
      const r = encumbrance({ strength: 10, carriedLb: 40 });
      assert.strictEqual(r.tier, "unencumbered");
      assert.strictEqual(r.speedPenaltyFt, 0);
      assert.strictEqual(r.disadvantage, false);
    });
    test("STR 10, 60 lb = encumbered (>5*STR)", () => {
      const r = encumbrance({ strength: 10, carriedLb: 60 });
      assert.strictEqual(r.tier, "encumbered");
      assert.strictEqual(r.speedPenaltyFt, 10);
      assert.strictEqual(r.disadvantage, false);
    });
    test("STR 10, 120 lb = heavily encumbered (>10*STR)", () => {
      const r = encumbrance({ strength: 10, carriedLb: 120 });
      assert.strictEqual(r.tier, "heavily-encumbered");
      assert.strictEqual(r.speedPenaltyFt, 20);
      assert.strictEqual(r.disadvantage, true);
    });
    test("STR 10, 160 lb = overburdened (>15*STR)", () => {
      const r = encumbrance({ strength: 10, carriedLb: 160 });
      assert.strictEqual(r.tier, "overburdened");
      assert.strictEqual(r.disadvantage, true);
    });
    test("Large size doubles capacity", () => {
      const r = encumbrance({ strength: 10, carriedLb: 200, sizeMultiplier: 2 });
      assert.strictEqual(r.capacityLb, 300);
      assert.strictEqual(r.tier, "encumbered");
    });
  });

  describe("currency", () => {
    test("purseToCp adds correctly", () => {
      assert.strictEqual(purseToCp({ cp: 5, sp: 3, ep: 1, gp: 2, pp: 1 }), 5 + 30 + 50 + 200 + 1000);
    });
    test("purseToGp divides by 100", () => {
      assert.strictEqual(purseToGp({ cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 }), 50);
    });
    test("purseWeightLb: 50 coins = 1 lb", () => {
      assert.strictEqual(purseWeightLb({ cp: 50, sp: 0, ep: 0, gp: 0, pp: 0 }), 1);
      assert.strictEqual(purseWeightLb({ cp: 25, sp: 25, ep: 0, gp: 0, pp: 0 }), 1);
    });
    test("consolidatePurse rolls up to pp/gp/sp/cp by default", () => {
      const r = consolidatePurse({ cp: 250, sp: 0, ep: 0, gp: 0, pp: 0 });
      // 250 cp = 2 sp 5 cp? No: 250 cp / 100 = 2 gp 50 cp → 2 gp, 5 sp, 0 cp.
      assert.strictEqual(r.gp, 2);
      assert.strictEqual(r.sp, 5);
      assert.strictEqual(r.cp, 0);
      assert.strictEqual(r.ep, 0);
      assert.strictEqual(r.pp, 0);
    });
    test("consolidatePurse keepElectrum preserves ep", () => {
      const r = consolidatePurse({ cp: 60, sp: 0, ep: 0, gp: 0, pp: 0 }, { keepElectrum: true });
      // 60 cp → 1 ep (50) + 1 sp (10).
      assert.strictEqual(r.ep, 1);
      assert.strictEqual(r.sp, 1);
    });
  });

  describe("containers", () => {
    test("containerStatus flags over-weight", () => {
      const c = CONTAINER_PRESETS.find(p => p.id === "pouch")!;
      const items = [{ id: "i1", name: "rock", weightLb: 10, quantity: 1, containerId: c.id }];
      const s = containerStatus(c, items);
      assert.strictEqual(s.overWeight, true);
    });
    test("totalCarriedLb sums items and empty container weight", () => {
      const c = CONTAINER_PRESETS.find(p => p.id === "backpack")!;
      const items = [
        { id: "i1", name: "rope", weightLb: 10, quantity: 2, containerId: c.id },
        { id: "i2", name: "torch", weightLb: 1, quantity: 5 },
      ];
      const total = totalCarriedLb(items, [c]);
      assert.strictEqual(total, 20 + 5 + c.emptyWeightLb);
    });
  });
});
