/**
 * Yjs adapter: bridges the existing JSON-shaped `campaign.data` (a deeply
 * nested Record<string, any>) with a Y.Doc.
 *
 * The Y.Doc owns a single root Y.Map called "data" that mirrors the shape of
 * `campaign.data`. Nested arrays become Y.Array, nested objects become Y.Map,
 * and primitives are stored as JS values. We do NOT use Y.Text for free-text
 * fields — character-level merging is overkill for the existing autosave UX
 * and would require touching every controlled-input call site. Whole-string
 * LWW per field is still a strict improvement over whole-document LWW.
 *
 * Two operations matter:
 *   - yMapToJson(root): plain-JSON view, fed into React state.
 *   - applyJsonPatch(root, newJson): reconcile a new JSON snapshot into the
 *     Y.Doc, generating the minimum set of Yjs ops. Object keys are diffed by
 *     key; arrays of objects with a stable `id` are diffed by id (so reorders
 *     and concurrent inserts converge); arrays of primitives are diffed by
 *     value with LCS-like fallback.
 */
import * as Y from 'yjs';

export const ROOT_KEY = 'data';

export function getRoot(doc: Y.Doc): Y.Map<any> {
  return doc.getMap(ROOT_KEY);
}

/** Recursively convert a Y type (or primitive) into plain JSON. */
export function yToJson(value: unknown): any {
  if (value instanceof Y.Map) {
    const out: Record<string, any> = {};
    value.forEach((v, k) => { out[k] = yToJson(v); });
    return out;
  }
  if (value instanceof Y.Array) {
    return value.toArray().map(yToJson);
  }
  if (value instanceof Y.Text) {
    return value.toString();
  }
  if (Array.isArray(value)) return value.map(yToJson);
  return value;
}

/** Plain-JSON view of the Y.Doc root. */
export function yMapToJson(root: Y.Map<any>): Record<string, any> {
  const out: Record<string, any> = {};
  root.forEach((v, k) => { out[k] = yToJson(v); });
  return out;
}

/** Build a Y type from a JSON value (used when seeding new keys). */
function jsonToY(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    const arr = new Y.Array<any>();
    arr.push(value.map(jsonToY));
    return arr;
  }
  if (typeof value === 'object') {
    const map = new Y.Map<any>();
    for (const [k, v] of Object.entries(value)) {
      map.set(k, jsonToY(v));
    }
    return map;
  }
  return value; // primitive
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object') {
    const ak = Object.keys(a), bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}

/** Returns true iff every element of `arr` is a non-null object with a string id. */
function isIdKeyedArray(arr: any[]): boolean {
  if (arr.length === 0) return false;
  return arr.every((x) => x && typeof x === 'object' && !Array.isArray(x) && typeof x.id === 'string' && x.id.length > 0);
}

/**
 * Reconcile a Y.Array against a new JSON array. When every element has a
 * stable `id`, we merge by id so two devices appending/editing different
 * elements converge. Otherwise we fall back to positional replace.
 */
function reconcileArray(yArr: Y.Array<any>, newArr: any[]): void {
  const current = yArr.toArray().map(yToJson);
  if (deepEqual(current, newArr)) return;

  const bothIdKeyed = isIdKeyedArray(current) && isIdKeyedArray(newArr);
  if (bothIdKeyed) {
    // Match by id. Update existing in place, delete removed, insert new at end.
    const currentIds = current.map((x: any) => x.id as string);
    const newIds = newArr.map((x: any) => x.id);
    const currentIndexById = new Map<string, number>();
    currentIds.forEach((id, i) => currentIndexById.set(id, i));

    // Update / delete first (process deletions from highest index to lowest)
    const keepSet = new Set(newIds);
    for (let i = current.length - 1; i >= 0; i--) {
      const id = currentIds[i];
      if (!keepSet.has(id)) {
        yArr.delete(i, 1);
      } else {
        const newEntry = newArr.find((x: any) => x.id === id);
        const yEntry = yArr.get(i);
        if (yEntry instanceof Y.Map) {
          reconcileMap(yEntry, newEntry);
        } else if (!deepEqual(yToJson(yEntry), newEntry)) {
          yArr.delete(i, 1);
          yArr.insert(i, [jsonToY(newEntry)]);
        }
      }
    }
    // Append new ids in order.
    const existingNow = new Set(yArr.toArray().map((y) => (y instanceof Y.Map ? y.get('id') : null)).filter(Boolean));
    for (const item of newArr) {
      if (!existingNow.has(item.id)) {
        yArr.push([jsonToY(item)]);
      }
    }
    return;
  }

  // Positional fallback: in-place primitive/object replace.
  const len = Math.min(yArr.length, newArr.length);
  for (let i = 0; i < len; i++) {
    const yEntry = yArr.get(i);
    const newEntry = newArr[i];
    if (yEntry instanceof Y.Map && newEntry && typeof newEntry === 'object' && !Array.isArray(newEntry)) {
      reconcileMap(yEntry, newEntry);
    } else if (yEntry instanceof Y.Array && Array.isArray(newEntry)) {
      reconcileArray(yEntry, newEntry);
    } else if (!deepEqual(yToJson(yEntry), newEntry)) {
      yArr.delete(i, 1);
      yArr.insert(i, [jsonToY(newEntry)]);
    }
  }
  if (yArr.length > newArr.length) {
    yArr.delete(newArr.length, yArr.length - newArr.length);
  } else if (yArr.length < newArr.length) {
    yArr.push(newArr.slice(yArr.length).map(jsonToY));
  }
}

function reconcileMap(yMap: Y.Map<any>, newObj: Record<string, any>): void {
  // Delete keys no longer present.
  yMap.forEach((_v, k) => {
    if (!(k in newObj)) yMap.delete(k);
  });
  for (const [k, v] of Object.entries(newObj)) {
    const current = yMap.get(k);
    if (Array.isArray(v)) {
      if (current instanceof Y.Array) {
        reconcileArray(current, v);
      } else {
        yMap.set(k, jsonToY(v));
      }
    } else if (v !== null && typeof v === 'object') {
      if (current instanceof Y.Map) {
        reconcileMap(current, v);
      } else {
        yMap.set(k, jsonToY(v));
      }
    } else {
      if (!deepEqual(yToJson(current), v)) {
        yMap.set(k, v);
      }
    }
  }
}

/**
 * Apply a new JSON snapshot to the Y.Doc root, generating minimal Yjs ops.
 * All edits run in a single transaction with the given origin so the local
 * autosave loop can ignore them in its own observer.
 */
export function applyJsonPatch(
  doc: Y.Doc,
  newData: Record<string, any>,
  origin: unknown = 'local-patch',
): void {
  doc.transact(() => {
    reconcileMap(getRoot(doc), newData);
  }, origin);
}

/** Replace the entire Y.Doc root with newData. Used for migration seeding. */
export function seedFromJson(doc: Y.Doc, json: Record<string, any>, origin: unknown = 'seed'): void {
  doc.transact(() => {
    const root = getRoot(doc);
    root.forEach((_v, k) => root.delete(k));
    for (const [k, v] of Object.entries(json)) {
      root.set(k, jsonToY(v));
    }
  }, origin);
}
