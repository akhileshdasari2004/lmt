import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../authService';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logIn calls signInWithEmailAndPassword with correct args', async () => {
    const email = 'a@b.com';
    const password = 'secret123';
    await authService.logIn(email, password);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), email, password);
  });

  it('signUp calls createUserWithEmailAndPassword', async () => {
    await authService.signUp('new@user.com', 'pass1234');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });

  it('logOut calls signOut', async () => {
    await authService.logOut();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('returns expected value on login success', async () => {
    const res = await authService.logIn('x@y.com', 'pass1234');
    expect(res).toHaveProperty('user');
    expect(res.user.email).toBe('test@example.com');
  });

  it('throws properly on login failure', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
    await expect(authService.logIn('bad@user.com', 'bad')).rejects.toThrow('Invalid credentials');
  });
});
