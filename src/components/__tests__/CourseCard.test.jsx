import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CourseCard from '../CourseCard';

const renderWithRouter = (course, progress) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<CourseCard course={course} progress={progress} />} />
        <Route path="/course/:id" element={<div>Course Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('CourseCard', () => {
  it('renders course title', () => {
    renderWithRouter({ id: 'c1', title: 'React Basics', lessons: [] }, 0);
    expect(screen.getByText('React Basics')).toBeInTheDocument();
  });

  it('renders progress percentage', () => {
    renderWithRouter({ id: 'c1', title: 'React Basics', lessons: [1,2] }, 50);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('clicking card navigates to course route', async () => {
    const user = userEvent.setup();
    renderWithRouter({ id: 'c1', title: 'React Basics', lessons: [] }, 0);
    await user.click(screen.getByRole('link'));
    expect(screen.getByText('Course Page')).toBeInTheDocument();
  });

  it('renders 0% and 100%', () => {
    const { rerender } = render(
      <MemoryRouter>
        <CourseCard course={{ id: 'c1', title: 'A', lessons: [1] }} progress={0} />
      </MemoryRouter>,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <CourseCard course={{ id: 'c1', title: 'A', lessons: [1] }} progress={100} />
      </MemoryRouter>,
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
