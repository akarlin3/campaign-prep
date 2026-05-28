import { useState, useEffect, useMemo } from 'react';
import { subscribeToCampaign, type Campaign } from '@/lib/firebase/campaigns';
import { subscribeToWorld, type World } from '@/lib/firebase/worlds';
import { WORLD_KEYS } from '@/lib/worldData';
import { useCrdtCampaign } from '@/lib/crdt/use-crdt-campaign';
import type { CrdtSync } from '@/lib/crdt/sync';

export function useCampaignAndWorld(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [campaignError, setCampaignError] = useState<Error | null>(null);
  const [worldError, setWorldError] = useState<Error | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [worldLoading, setWorldLoading] = useState(true);

  // 1. Subscribe to Campaign metadata (name, userId, playerIds, etc.). The
  // `data` field on this snapshot is now treated as a legacy seed only — the
  // live, merged campaign content comes from the CRDT layer below.
  useEffect(() => {
    setCampaignLoading(true);
    return subscribeToCampaign(
      campaignId,
      (c) => {
        setCampaign(c);
        setCampaignLoading(false);
      },
      (err) => {
        setCampaignError(err);
        setCampaignLoading(false);
      }
    );
  }, [campaignId]);

  // 1b. CRDT layer: hydrate from IndexedDB instantly, reconcile with the
  // Firestore update log, and re-render whenever the merged state changes.
  // First-time seed pulls from `campaign.data` if both local + remote logs
  // are empty (legacy migration). The CRDT JSON view supersedes
  // `campaign.data` whenever it's ready.
  const crdt = useCrdtCampaign(campaignId, campaign);

  // 2. Subscribe to World if campaign.worldId is present.
  useEffect(() => {
    if (!campaign) {
      return;
    }
    if (!campaign.worldId) {
      setWorld(null);
      setWorldLoading(false);
      return;
    }
    setWorldLoading(true);
    return subscribeToWorld(
      campaign.worldId,
      (w) => {
        setWorld(w);
        setWorldLoading(false);
      },
      (err) => {
        setWorldError(err);
        setWorldLoading(false);
      }
    );
  }, [campaign]);

  const loading = campaignLoading || worldLoading;
  const error = campaignError || worldError;

  // Compose the merged Campaign object exposed to React consumers. The data
  // field is sourced from the CRDT view once it's available; otherwise we
  // fall back to the Firestore JSON so first paint is never blank.
  const mergedCampaign = useMemo<Campaign | null>(() => {
    if (!campaign) return null;
    const baseData = crdt.data ?? campaign.data ?? {};
    const mergedData: Record<string, any> = { ...baseData };
    if (world) {
      // Strict inheritance: World lore overrides campaign data.
      for (const key of WORLD_KEYS) {
        if (world.data[key] !== undefined) {
          mergedData[key] = world.data[key];
        }
      }
    }
    return { ...campaign, data: mergedData };
  }, [campaign, world, crdt.data]);

  return {
    campaign: mergedCampaign,
    rawCampaign: campaign,
    world,
    loading,
    error,
    /** CRDT sync handle — null until first render. */
    crdt: crdt.sync as CrdtSync | null,
    /** Apply a JSON snapshot of campaign.data into the Y.Doc. */
    applyCampaignData: crdt.applyJson,
    /** True once local IndexedDB hydration + initial remote pull are done. */
    crdtReady: crdt.ready,
  };
}
