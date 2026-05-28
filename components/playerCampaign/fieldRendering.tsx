'use client';

// Field-rendering helpers extracted from PlayerCampaignView. These format
// arbitrary projected entity field values into player-facing display, matching
// the original behavior exactly.

import React from 'react';
import type { EntityRecord } from './types';

// "classLevel" -> "Class Level". Splits camelCase and capitalizes.
export function prettify(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// True when a value should be treated as "absent" and skipped in the UI.
export function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') {
    return Object.values(v as EntityRecord).every((x) => x === '' || x == null);
  }
  return false;
}

// Renders a single field value, dispatching on its runtime shape:
// - arrays of objects -> bulleted list of joined values
// - arrays of scalars -> comma-joined
// - objects -> "Key: value" pairs joined with "·"
// - scalars -> stringified
export function FieldValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return null;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (typeof value[0] === 'object') {
      return (
        <ul className="list-disc space-y-0.5 pl-4">
          {value.map((v, i) => (
            <li key={i}>{Object.values(v as EntityRecord).filter(Boolean).join(' · ')}</li>
          ))}
        </ul>
      );
    }
    return <>{(value as unknown[]).filter(Boolean).join(', ')}</>;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as EntityRecord).filter(([, v]) => v !== '' && v != null);
    if (entries.length === 0) return null;
    return <>{entries.map(([k, v]) => `${prettify(k)}: ${v}`).join(' · ')}</>;
  }

  return <>{String(value)}</>;
}
