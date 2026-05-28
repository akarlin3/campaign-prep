'use client';

// Read-only card for a projected entity (character, npc, location, faction,
// clock). Sorts fields by the per-type FIELD_ORDER, then alphabetically for any
// remaining fields, and renders each via FieldValue. Extracted verbatim from
// PlayerCampaignView.

import React from 'react';
import { FIELD_ORDER } from './constants';
import { FieldValue, isEmptyValue, prettify } from './fieldRendering';
import type { EntityRecord } from './types';

export default function EntityCard({
  entity,
  entityType,
}: {
  entity: EntityRecord;
  entityType?: string;
}) {
  const name = (entity.name as string) || (entity.text as string) || 'Unnamed';
  const fields = Object.entries(entity).filter(
    ([k, v]) => k !== 'id' && k !== 'name' && k !== 'text' && !isEmptyValue(v),
  );

  if (entityType && FIELD_ORDER[entityType]) {
    const order = FIELD_ORDER[entityType];
    fields.sort((a, b) => {
      const idxA = order.indexOf(a[0]);
      const idxB = order.indexOf(b[0]);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a[0].localeCompare(b[0]);
    });
  }

  return (
    <div className="space-y-1.5 rounded border border-rule bg-parchment p-3 shadow-card">
      <div className="font-display text-lg tracking-wide text-ink">{name}</div>
      {fields.map(([k, v]) => (
        <div key={k} className="font-serif text-sm text-ink-soft">
          <span className="font-semibold text-ink">{prettify(k)}:</span> <FieldValue value={v} />
        </div>
      ))}
    </div>
  );
}
