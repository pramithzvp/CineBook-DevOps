'use client';

import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Ticket, Check, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthUser, loginUser, registerUser } from '@/lib/auth-api';
import { validEmail } from '@/lib/cinebook';

export default function AuthDialog({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function close() {
    setPassword('');
    setConfirm('');
    setError('');
    onClose();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!validEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Enter a name with at least 2 characters.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        setError('The passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      const user = mode === 'register'
        ? await registerUser({ name: name.trim(), email: normalizedEmail, password })
        : await loginUser({ email: normalizedEmail, password });
      onLogin(user);
      setPassword('');
      setConfirm('');
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to authenticate. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) close(); }}>
      <DialogContent className="auth-modal">
        <div className="auth-brand"><Ticket size={29}/><span>CineBook</span></div>
        <DialogTitle>{mode === 'login' ? 'Welcome back.' : 'Make movie nights yours.'}</DialogTitle>
        <DialogDescription>
          {mode === 'login'
            ? 'Sign in to manage your profile and bookings.'
            : 'Create your CineBook account and keep every movie night together.'}
        </DialogDescription>
        <Tabs value={mode} onValueChange={value => {
          setMode(value as 'login' | 'register');
          setError('');
          setPassword('');
          setConfirm('');
        }}>
          <TabsList className="auth-tabs">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="register">Create account</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="notice">
          <Info size={18}/>
          <p><b>Secure account.</b> Passwords are protected, and your session is maintained by CineBook.</p>
        </div>
        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && (
            <label>Full name
              <input value={name} onChange={event => setName(event.target.value)} maxLength={100} required placeholder="Your name" autoComplete="name"/>
            </label>
          )}
          <label>Email address
            <input type="email" required maxLength={200} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/>
          </label>
          <label>Password
            <div className="password-wrap">
              <input type={visible ? 'text' : 'password'} required maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password"/>
              <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(value => !value)}>
                {visible ? <EyeOff size={19}/> : <Eye size={19}/>}
              </button>
            </div>
          </label>
          {mode === 'register' && <>
            <div className="password-checks">
              <span className={password.length >= 8 ? 'met' : ''}><Check size={13}/>At least 8 characters</span>
            </div>
            <label>Confirm password
              <input type={visible ? 'text' : 'password'} required maxLength={72} autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Repeat your password"/>
            </label>
          </>}
          {error && <p role="alert" className="error">{error}</p>}
          <button className="primary wide" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            <ArrowRight size={18}/>
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
