// The single source of truth for "what can this slot see?". Used by the
// projection builder (GM publisher), the GM-side "preview as player" filter,
// and mirrored by the security-rules tests. Any visibility logic elsewhere is a
// bug — extend this instead (see the Heuristic-drift rule in the plan).

import {
  type EntityVisibility,
  type FieldPrivacyMap,
  type FieldVisibilityDefaults,
  type PlayerEntityType,
  isPlayerEntityType,
} from './types';

export type ResolveVisibilityArgs = {
  entityType: string;
  // The entity's visibility record from PlayerConfig.entityVisibility. Undefined
  // means "never configured" → treated as fully private (fail-closed).
  visibility: EntityVisibility | undefined;
  slotId: string;
  defaults: FieldVisibilityDefaults;
  // The field keys actually present on the entity instance.
  fields: string[];
};

export type ResolveVisibilityResult = {
  entityVisible: boolean;
  visibleFields: Set<string>;
};

function entityIsVisibleToSlot(
  visibility: EntityVisibility | undefined,
  slotId: string,
): boolean {
  if (!visibility) return false;
  switch (visibility.mode) {
    case 'party':
      return true;
    case 'custom':
      return Array.isArray(visibility.allowedSlotIds)
        && visibility.allowedSlotIds.includes(slotId);
    case 'private':
    default:
      return false;
  }
}

// Resolve a single field's effective privacy: per-instance override wins over
// the entity-type default; anything unspecified is private (fail-closed).
export function resolveFieldPrivacy(
  field: string,
  typeDefaults: FieldPrivacyMap,
  overrides: FieldPrivacyMap | undefined,
): 'public' | 'private' {
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, field)) {
    return overrides[field];
  }
  if (Object.prototype.hasOwnProperty.call(typeDefaults, field)) {
    return typeDefaults[field];
  }
  return 'private';
}

export function resolveVisibility(args: ResolveVisibilityArgs): ResolveVisibilityResult {
  const { entityType, visibility, slotId, defaults, fields } = args;

  // Unknown entity type → fully private, no matter what visibility claims.
  if (!isPlayerEntityType(entityType)) {
    return { entityVisible: false, visibleFields: new Set() };
  }

  if (!entityIsVisibleToSlot(visibility, slotId)) {
    return { entityVisible: false, visibleFields: new Set() };
  }

  const typeDefaults = defaults[entityType as PlayerEntityType] ?? {};
  const overrides = visibility?.fieldOverrides;
  const visibleFields = new Set<string>();
  for (const field of fields) {
    if (resolveFieldPrivacy(field, typeDefaults, overrides) === 'public') {
      visibleFields.add(field);
    }
  }
  return { entityVisible: true, visibleFields };
}
