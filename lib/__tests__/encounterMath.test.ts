import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { difficultyForSolo, XP_THRESHOLDS } from '../encounterMath';

describe('difficultyForSolo', () => {
  it('calculates difficulty correctly for standard solo level 1', () => {
    // Level 1 standard: Easy=25, Med=50, Hard=75, Deadly=100
    // Mod = 0.75
    // soloEasy = Math.round(25 * 0.75) = 19
    // soloMedium = Math.round(50 * 0.75) = 38
    // soloHard = Math.round(75 * 0.75) = 56
    // soloDeadly = Math.round(100 * 0.75) = 75
    // soloDeadly * 1.5 = 112.5 -> 112

    // Trivial
    let res = difficultyForSolo(10, 1, false);
    assert.equal(res.rating, 'Trivial');
    assert.equal(res.rationale, 'Below solo easy threshold (19)');

    // Easy
    res = difficultyForSolo(20, 1, false);
    assert.equal(res.rating, 'Easy');
    assert.equal(res.rationale, 'Solo easy: 19–37');

    // Medium
    res = difficultyForSolo(40, 1, false);
    assert.equal(res.rating, 'Medium');
    assert.equal(res.rationale, 'Solo medium: 38–55');

    // Hard
    res = difficultyForSolo(60, 1, false);
    assert.equal(res.rating, 'Hard');
    assert.equal(res.rationale, 'Solo hard: 56–74');

    // Deadly
    res = difficultyForSolo(80, 1, false);
    assert.equal(res.rating, 'Deadly');
    assert.equal(res.rationale, 'Solo deadly: 75+');

    // Lethal
    res = difficultyForSolo(120, 1, false);
    assert.equal(res.rating, 'Lethal');
    assert.equal(res.rationale, 'Well above solo deadly threshold (75). Reconsider.');
  });

  it('calculates difficulty correctly for gestalt solo level 1', () => {
    // Level 1 gestalt: Easy=25, Med=50, Hard=75, Deadly=100
    // Mod = 1.0
    // soloEasy = 25
    // soloMedium = 50
    // soloHard = 75
    // soloDeadly = 100

    // Trivial
    let res = difficultyForSolo(20, 1, true);
    assert.equal(res.rating, 'Trivial');
    assert.equal(res.rationale, 'Below gestalt easy threshold (25)');

    // Easy
    res = difficultyForSolo(30, 1, true);
    assert.equal(res.rating, 'Easy');
    assert.equal(res.rationale, 'Gestalt easy: 25–49');

    // Medium
    res = difficultyForSolo(60, 1, true);
    assert.equal(res.rating, 'Medium');
    assert.equal(res.rationale, 'Gestalt medium: 50–74');

    // Hard
    res = difficultyForSolo(80, 1, true);
    assert.equal(res.rating, 'Hard');
    assert.equal(res.rationale, 'Gestalt hard: 75–99');

    // Deadly
    res = difficultyForSolo(120, 1, true);
    assert.equal(res.rating, 'Deadly');
    assert.equal(res.rationale, 'Gestalt deadly: 100+');

    // Lethal
    res = difficultyForSolo(160, 1, true);
    assert.equal(res.rating, 'Lethal');
    assert.equal(res.rationale, 'Well above gestalt deadly threshold (100). Reconsider.');
  });

  it('falls back to level 1 thresholds if level is out of bounds', () => {
    const resLevel0 = difficultyForSolo(40, 0, false);
    const resLevel25 = difficultyForSolo(40, 25, false);
    const resLevel1 = difficultyForSolo(40, 1, false);

    assert.deepEqual(resLevel0, resLevel1);
    assert.deepEqual(resLevel25, resLevel1);
  });
});
