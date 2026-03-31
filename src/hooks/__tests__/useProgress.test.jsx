import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useProgress } from '../useProgress';
import * as fsService from '../../services/firestoreService';

const Consumer = ({ userId = 'u1', courseId = 'c1' }) => {
  const { progress, calculateProgress, toggleLesson } = useProgress(userId, courseId);
  return (
    <div>
      <div data-testid="completed">{(progress.completedLessons || []).join(',')}</div>
      <div data-testid="p0">{calculateProgress([])}</div>
      <div data-testid="p50">{calculateProgress([{}, {}])}</div>
      <button onClick={() => toggleLesson('l1')}>toggle</button>
    </div>
  );
};

describe('useProgress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null-like progress for new user and 0% with empty lessons', async () => {
    vi.spyOn(fsService, 'getOrCreateProgress').mockResolvedValue({ completedLessons: [] });
    render(<Consumer userId={null} courseId={null} />);
    expect(screen.getByTestId('p0')).toHaveTextContent('0');
  });

  it('returns completedLessons and percentage calculations', async () => {
    vi.spyOn(fsService, 'getOrCreateProgress').mockResolvedValue({ completedLessons: ['l1'] });
    render(<Consumer />);
    await waitFor(() => expect(screen.getByTestId('p50')).toHaveTextContent('50'));
  });

  it('toggleLesson triggers firestore update path', async () => {
    const user = userEvent.setup();
    vi.spyOn(fsService, 'getOrCreateProgress').mockResolvedValue({ completedLessons: [] });
    const toggleSpy = vi.spyOn(fsService, 'toggleLessonComplete').mockResolvedValue(['l1']);

    render(<Consumer />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(toggleSpy).toHaveBeenCalledWith('u1', 'c1', 'l1');
  });
});
