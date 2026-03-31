import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../useAuth';
import * as authService from '../../services/authService';

const TestConsumer = () => {
  const { user, loading, logIn, logOut } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="email">{user?.email || 'null'}</div>
      <button onClick={() => logIn('a@b.com', '123456')}>login</button>
      <button onClick={() => logOut()}>logout</button>
    </div>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct user when logged in', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('test@example.com'));
  });

  it('loading state resolves from true to false', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
  });

  it('login and logout functions call underlying service', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authService, 'logIn').mockResolvedValue({ user: { uid: 'u1' } });
    const logoutSpy = vi.spyOn(authService, 'logOut').mockResolvedValue();

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await user.click(screen.getByRole('button', { name: 'login' }));
    await user.click(screen.getByRole('button', { name: 'logout' }));

    expect(loginSpy).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
  });
});
