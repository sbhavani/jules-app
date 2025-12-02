import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SessionList } from './session-list';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';

// Mock the provider
jest.mock('@/lib/jules/provider', () => ({
  useJules: jest.fn(),
}));

describe('SessionList', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      sourceId: 'src1',
      title: 'Older Activity',
      status: 'active',
      createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T10:00:00Z').toISOString(),
      lastActivityAt: new Date('2023-01-01T11:00:00Z').toISOString(),
    },
    {
      id: '2',
      sourceId: 'src1',
      title: 'Newer Activity',
      status: 'completed',
      createdAt: new Date('2023-01-01T09:00:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T09:00:00Z').toISOString(),
      lastActivityAt: new Date('2023-01-01T12:00:00Z').toISOString(),
    },
    {
      id: '3',
      sourceId: 'src1',
      title: 'No Activity (Use CreatedAt)',
      status: 'failed',
      createdAt: new Date('2023-01-01T11:30:00Z').toISOString(),
      updatedAt: new Date('2023-01-01T11:30:00Z').toISOString(),
      // lastActivityAt is undefined
    },
  ];

  beforeEach(() => {
    (useJules as jest.Mock).mockReturnValue({
      client: {
        listSessions: jest.fn().mockResolvedValue(mockSessions),
      },
    });
  });

  it('renders loading state initially', () => {
    render(<SessionList onSelectSession={jest.fn()} />);
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
  });

  it('renders sessions sorted by lastActivityAt (descending)', async () => {
    render(<SessionList onSelectSession={jest.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument();
    });

    // Since CardTitle is a div, we query by text directly or custom matcher.
    // However, the titles are unique in this test.
    // We can query all elements that match the session titles and check their order in the DOM.

    // We can use `screen.getAllByText` if we are careful, or query selectors.
    // Given the structure, we can just find all elements with text content matching the titles.

    // Expected order:
    // 1. Newer Activity (12:00)
    // 2. No Activity (11:30)
    // 3. Older Activity (11:00)

    const newerActivity = screen.getByText('Newer Activity');
    const noActivity = screen.getByText('No Activity (Use CreatedAt)');
    const olderActivity = screen.getByText('Older Activity');

    expect(newerActivity).toBeInTheDocument();
    expect(noActivity).toBeInTheDocument();
    expect(olderActivity).toBeInTheDocument();

    // Check order
    const allTitles = screen.getAllByText(/Activity/);
    // This might match descriptions too if they contained "Activity", but here they don't.
    // However, "No Activity (Use CreatedAt)" matches.
    // Let's filter to only include the title texts.

    const displayedTitles = allTitles.map(el => el.textContent).filter(text =>
      text === 'Newer Activity' ||
      text === 'No Activity (Use CreatedAt)' ||
      text === 'Older Activity'
    );

    expect(displayedTitles).toEqual([
      'Newer Activity',
      'No Activity (Use CreatedAt)',
      'Older Activity'
    ]);
  });
});
