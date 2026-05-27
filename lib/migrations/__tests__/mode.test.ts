import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateCampaignModeAdmin } from '../mode';
import * as admin from '../../firebase/admin';

vi.mock('../../firebase/admin', () => {
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockDoc = vi.fn().mockReturnValue({ update: mockUpdate });
  const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc });
  return {
    getAdminDb: vi.fn().mockReturnValue({
      collection: mockCollection,
    }),
    mockUpdate,
    mockDoc,
    mockCollection,
  };
});

describe('Mode Migration Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('migrates legacy __soloMode === true to duet', async () => {
    const snap = {
      data: () => ({
        data: {
          __soloMode: true,
        },
      }),
    };

    await migrateCampaignModeAdmin('camp-1', snap as any);

    expect((admin as any).mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        'data.mode': 'duet',
        'data.legacySoloMode': true,
        'data.modeMigratedAt': expect.any(Number),
      })
    );
  });

  it('migrates legacy __soloMode === false to standard', async () => {
    const snap = {
      data: () => ({
        data: {
          __soloMode: false,
        },
      }),
    };

    await migrateCampaignModeAdmin('camp-2', snap as any);

    expect((admin as any).mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        'data.mode': 'standard',
        'data.legacySoloMode': false,
        'data.modeMigratedAt': expect.any(Number),
      })
    );
  });

  it('does not migrate if modeMigratedAt is already present', async () => {
    const snap = {
      data: () => ({
        data: {
          __soloMode: true,
          modeMigratedAt: 12345678,
        },
      }),
    };

    await migrateCampaignModeAdmin('camp-3', snap as any);

    expect((admin as any).mockUpdate).not.toHaveBeenCalled();
  });
});
