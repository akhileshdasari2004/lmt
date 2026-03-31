import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LessonItem from '../LessonItem';

describe('LessonItem', () => {
  it('renders lesson title', () => {
    render(<LessonItem lesson={{ id: 'l1', title: 'Intro', order: 0 }} isCompleted={false} onToggle={vi.fn()} />);
    expect(screen.getByText('Intro')).toBeInTheDocument();
  });

  it('unchecked when not completed, checked when completed', () => {
    const { rerender } = render(
      <LessonItem lesson={{ id: 'l1', title: 'Intro', order: 0 }} isCompleted={false} onToggle={vi.fn()} />,
    );
    expect(screen.getByRole('button')).not.toHaveTextContent('Done');
    rerender(<LessonItem lesson={{ id: 'l1', title: 'Intro', order: 0 }} isCompleted onToggle={vi.fn()} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('clicking calls onToggle with lesson id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn().mockResolvedValue();
    render(<LessonItem lesson={{ id: 'l1', title: 'Intro', order: 0 }} isCompleted={false} onToggle={onToggle} />);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('l1');
  });

  it('does not crash with minimal props', () => {
    render(<LessonItem lesson={{ id: 'l1', title: '', order: 0 }} isCompleted={false} onToggle={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
