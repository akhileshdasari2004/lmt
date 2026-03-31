import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useCourses } from '../useCourses';
import * as fsService from '../../services/firestoreService';

const Consumer = () => {
  const { courses, loading, error } = useCourses();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="count">{courses.length}</div>
      <div data-testid="error">{error || ''}</div>
    </div>
  );
};

describe('useCourses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array initially', () => {
    vi.spyOn(fsService, 'getAllCourses').mockImplementation(() => new Promise(() => {}));
    render(<Consumer />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('returns course list after resolve and transitions loading', async () => {
    vi.spyOn(fsService, 'getAllCourses').mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
    render(<Consumer />);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('handles firestore error without crash', async () => {
    vi.spyOn(fsService, 'getAllCourses').mockRejectedValue(new Error('boom'));
    render(<Consumer />);
    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('boom'));
  });
});
