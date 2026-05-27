import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayersManager from '../PlayersManager';
import React from 'react';

// Mock the firebase campaigns library
const approvePlayerMock = vi.fn().mockResolvedValue(undefined);
const rejectPlayerMock = vi.fn().mockResolvedValue(undefined);
const removePlayerMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/firebase/campaigns', () => ({
  approvePlayer: (...args: any[]) => approvePlayerMock(...args),
  rejectPlayer: (...args: any[]) => rejectPlayerMock(...args),
  removePlayer: (...args: any[]) => removePlayerMock(...args),
}));

const mockCampaign = {
  id: 'campaign-123',
  userId: 'user-gm',
  name: 'Epic Campaign',
  data: {},
  done: {},
  createdAt: null,
  updatedAt: null,
  playerIds: ['player-1', 'player-2'],
  pendingPlayers: [
    { uid: 'pending-1', email: 'pending1@example.com' }
  ],
  playerEmails: {
    'player-1': 'player1@example.com'
  }
};

describe('PlayersManager', () => {
  beforeEach(() => {
    approvePlayerMock.mockClear();
    rejectPlayerMock.mockClear();
    removePlayerMock.mockClear();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('renders dropdown with invite link, pending requests, and approved players', () => {
    render(<PlayersManager campaign={mockCampaign as any} />);

    // Renders the trigger button showing count
    const trigger = screen.getByText('Players (2)');
    expect(trigger).toBeDefined();

    // Check pending count badge
    expect(screen.getByText('1')).toBeDefined();

    // Invite link truncated is shown
    expect(screen.getByText('.../invite/campaign')).toBeDefined();

    // Pending player email is shown
    expect(screen.getByText('pending1@example.com')).toBeDefined();

    // Approved player email is shown
    expect(screen.getByText('player1@example.com')).toBeDefined();

    // Existing approved player fallback uid is shown
    expect(screen.getByText('User (player-2)')).toBeDefined();

    // Summary footer is shown
    expect(screen.getByText('2 players in campaign.')).toBeDefined();
  });

  it('triggers approvePlayer when clicking Check icon on pending player', async () => {
    render(<PlayersManager campaign={mockCampaign as any} />);

    const approveButton = screen.getByTitle('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(approvePlayerMock).toHaveBeenCalledWith('campaign-123', mockCampaign.pendingPlayers[0]);
    });
  });

  it('triggers rejectPlayer when clicking X icon on pending player', async () => {
    render(<PlayersManager campaign={mockCampaign as any} />);

    const rejectButton = screen.getByTitle('Reject');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(rejectPlayerMock).toHaveBeenCalledWith('campaign-123', mockCampaign.pendingPlayers[0]);
    });
  });

  it('triggers removePlayer when clicking remove on an approved player and GM confirms', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(<PlayersManager campaign={mockCampaign as any} />);

    const removeButtons = screen.getAllByTitle('Remove player');
    expect(removeButtons).toHaveLength(2);

    // Remove the first approved player
    fireEvent.click(removeButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to remove player1@example.com from this campaign?');
    await waitFor(() => {
      expect(removePlayerMock).toHaveBeenCalledWith('campaign-123', 'player-1');
    });
  });

  it('does not trigger removePlayer when GM cancels removal confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<PlayersManager campaign={mockCampaign as any} />);

    const removeButtons = screen.getAllByTitle('Remove player');
    fireEvent.click(removeButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(removePlayerMock).not.toHaveBeenCalled();
  });
});
