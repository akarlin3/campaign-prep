import { test, describe } from "node:test";
import assert from "node:assert";
import {
  fallingDamage5e,
  fallingObjectDamage,
  blastRadiusFt,
  blastOcclusion,
  structuralFailure,
  MATERIALS,
} from "../hazards.js";

describe("hazards", () => {
  describe("fallingDamage5e", () => {
    test("0 ft = 0d6", () => {
      const r = fallingDamage5e(0);
      assert.strictEqual(r.dice, 0);
      assert.strictEqual(r.averageDamage, 0);
      assert.strictEqual(r.capped, false);
    });
    test("30 ft = 3d6", () => {
      const r = fallingDamage5e(30);
      assert.strictEqual(r.dice, 3);
      assert.strictEqual(r.averageDamage, 10.5);
    });
    test("caps at 20d6 above 200 ft", () => {
      const r = fallingDamage5e(500);
      assert.strictEqual(r.dice, 20);
      assert.strictEqual(r.capped, true);
    });
  });

  describe("fallingObjectDamage", () => {
    test("returns kinetic energy and a dice suggestion", () => {
      const r = fallingObjectDamage({ weightLb: 100, fallFt: 30 });
      assert.ok(r.velocityMs > 0);
      assert.ok(r.energyJ > 0);
      assert.match(r.suggestedDice, /^\d+d6$/);
    });
    test("light object short fall is low energy", () => {
      const r = fallingObjectDamage({ weightLb: 1, fallFt: 5 });
      assert.ok(r.energyJ < 100);
    });
  });

  describe("blastRadiusFt", () => {
    test("scales by cube root", () => {
      const r1 = blastRadiusFt(1);
      const r8 = blastRadiusFt(8); // cbrt(8) = 2
      assert.ok(Math.abs(r8 / r1 - 2) < 0.01);
    });
    test("severity ordering: lethal < injurious < window", () => {
      const l = blastRadiusFt(1, "lethal");
      const i = blastRadiusFt(1, "injurious");
      const w = blastRadiusFt(1, "window");
      assert.ok(l < i);
      assert.ok(i < w);
    });
  });

  describe("blastOcclusion", () => {
    test("clamps and buckets correctly", () => {
      assert.strictEqual(blastOcclusion(-1).bucket, "none");
      assert.strictEqual(blastOcclusion(0).bucket, "none");
      assert.strictEqual(blastOcclusion(0.3).bucket, "half");
      assert.strictEqual(blastOcclusion(0.7).bucket, "three-quarters");
      assert.strictEqual(blastOcclusion(1).bucket, "full");
      assert.strictEqual(blastOcclusion(1).damageMultiplier, 0);
    });
  });

  describe("structuralFailure", () => {
    test("paper fails under heavy load", () => {
      const paper = MATERIALS.find(m => m.id === "paper")!;
      // paper compressive ≈ 0.5 MPa; yield ≈ 0.165 MPa.
      // 500 kg / 0.001 m² = ~4.9 MPa — way over.
      const r = structuralFailure({ loadKg: 500, areaM2: 0.001, material: paper });
      assert.strictEqual(r.failing, true);
    });
    test("stone holds typical load", () => {
      const stone = MATERIALS.find(m => m.id === "stone")!;
      const r = structuralFailure({ loadKg: 100, areaM2: 0.1, material: stone });
      assert.strictEqual(r.failing, false);
    });
  });
});
