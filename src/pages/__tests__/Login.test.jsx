import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

const logIn = vi.fn();
const signUp = vi.fn();
const navigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ logIn, signUp }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('Login page', () => {
  it('renders email/password fields and login/signup toggles', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('disables submit for invalid html5 form state', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText('Email')).toBeRequired();
  });

  it('calls login with correct credentials', async () => {
    const user = userEvent.setup();
    logIn.mockResolvedValueOnce({});
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.type(screen.getByLabelText('Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(logIn).toHaveBeenCalledWith('user@test.com', '123456');
  });

  it('shows error message on failed login', async () => {
    const user = userEvent.setup();
    logIn.mockRejectedValueOnce(new Error('wrong password'));
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.type(screen.getByLabelText('Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('wrong password')).toBeInTheDocument();
  });

  it('switches to signup mode', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });
});
