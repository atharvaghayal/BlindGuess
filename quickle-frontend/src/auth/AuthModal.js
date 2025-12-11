import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, login, signup, startOauth } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAuthModalOpen) return null;

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (mode === 'login') {
                await login({ email, password });
            } else {
                await signup({ email, password });
            }
            setEmail('');
            setPassword('');
        } catch (err) {
            const message =
                err?.response?.data?.detail ||
                err?.message ||
                'Unable to authenticate. Please try again.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleMode = () => {
        setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
        setError('');
    };

    return (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={closeAuthModal} aria-label="Close auth modal">
                    ×
                </button>
                <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>

                <form className="auth-form" onSubmit={submit}>
                    <label>
                        Email
                        <input
                            type="email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>
                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            required
                            minLength={8}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                        />
                    </label>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="primary-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <div className="oauth-actions">
                    <button className="secondary-btn" onClick={() => startOauth('google')}>
                        Continue with Google
                    </button>
                    <button className="secondary-btn" onClick={() => startOauth('github')}>
                        Continue with GitHub
                    </button>
                </div>

                <div className="switch-mode">
                    {mode === 'login' ? (
                        <>
                            New here? <button onClick={toggleMode}>Create an account</button>
                        </>
                    ) : (
                        <>
                            Already have an account? <button onClick={toggleMode}>Log in</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

