import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

vi.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({ calculateProgress: () => 0, loading: false, error: null }),
}));

vi.mock('../../components/Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

const setAssignments = (cb) => cb([]);
const setRequests = (cb) => cb([]);

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', email: 'student@test.com' } }),
}));

vi.mock('../../services/firestoreService', () => ({
  getAllCourses: vi.fn(() => Promise.resolve([])),
  createSubjectRequest: vi.fn(() => Promise.resolve()),
  getStudentAssignments: vi.fn((uid, cb) => {
    setAssignments(cb);
    return vi.fn();
  }),
  getStudentRequests: vi.fn((uid, cb) => {
    setRequests(cb);
    return vi.fn();
  }),
}));

describe('Dashboard page', () => {
  it('shows loading then empty state when no courses exist', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Loading courses/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/No lessons assigned yet/i)).toBeInTheDocument());
  });

  it('renders course cards when assignments and courses are available', async () => {
    const { getAllCourses, getStudentAssignments } = await import('../../services/firestoreService');
    getAllCourses.mockResolvedValueOnce([{ id: 'c1', title: 'Course 1', lessons: [{ id: 'l1' }] }]);
    getStudentAssignments.mockImplementationOnce((uid, cb) => {
      cb([{ courseId: 'c1', courseTitle: 'Course 1', assignmentType: 'subject', lessonId: null }]);
      return vi.fn();
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByText('Course 1').length).toBeGreaterThan(0));
  });
});
