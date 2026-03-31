import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Course from '../Course';

const toggleLesson = vi.fn(() => Promise.resolve());

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', email: 'test@example.com' } }),
}));

vi.mock('../../hooks/useCourses', () => ({
  useCourse: () => ({
    course: { id: 'c1', title: 'Course One', lessons: [{ id: 'l1', title: 'Lesson 1', order: 0 }] },
    loading: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({
    progress: { completedLessons: [] },
    toggleLesson,
    calculateProgress: (lessons) => (lessons.length ? 0 : 0),
    loading: false,
    error: null,
  }),
}));

vi.mock('../../services/firestoreService', () => ({
  getOrCreateProgress: vi.fn(() => Promise.resolve({ completedLessons: [] })),
  getStudentAssignments: vi.fn((uid, cb) => {
    cb([{ courseId: 'c1', lessonId: 'l1', lessonTitle: 'Lesson 1' }]);
    return vi.fn();
  }),
}));

describe('Course page', () => {
  it('renders title and lesson list', async () => {
    render(
      <MemoryRouter initialEntries={['/course/c1']}>
        <Routes>
          <Route path="/course/:id" element={<Course />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Course One').length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText('Lesson 1')).toBeInTheDocument());
  });

  it('toggling lesson calls update function', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/course/c1']}>
        <Routes>
          <Route path="/course/:id" element={<Course />} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(await screen.findByTitle(/Mark lesson as complete/i));
    expect(toggleLesson).toHaveBeenCalled();
  });
});
