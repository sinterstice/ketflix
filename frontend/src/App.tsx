import React, { useState, useEffect } from "react";

import * as api from './api';

interface SessionData {
    email?: string;
    authenticated: boolean;
}

interface Self {
    dataLimit: Number;
    hasAdmin: boolean;
}

function App() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [self, setSelf] = useState<Self | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [resetHash, setResetHash] = useState<string | null>();
    const [alert, setAlert] = useState<string | null>(null);

    const search = new URLSearchParams(location.search);
    const passwordReset = search.get('passwordReset');

    const fetchSession = async () => {
        setAlert(null);
        const result = await api.session();
        setSession(result);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAlert(null);
        setSession(null);
        if (resetHash) {
            try {
                const result = await api.resetPassword(email, password, resetHash)
                search.delete('passwordReset');
                const newUrl = `${window.location.pathname}?${search.toString()}`;
                window.history.replaceState({}, '', newUrl);
                setEmail(result.email);
            } catch(err) {
                setAlert((err as Error).message);
            }
        } else {
            try {
                const result = await api.login(email, password);
            } catch(err) {
                setAlert((err as Error).message);
            }
        }

        fetchSession();
    }

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            const result = await api.requestPasswordReset(email)
            setAlert('Password reset email sent');
        } catch(err) {
            setAlert((err as Error).message);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    useEffect(() => {
        setResetHash(passwordReset);
    }, [passwordReset]);

    const fetchSelf = async () => {
        setAlert(null);
        const result = await api.getSelf();
        setSelf(result);
    };

    useEffect(() => {
        if (session?.authenticated && !self) {
            fetchSelf();
        }
    }, [session]);

    return (
        <div className="main">
            {alert && <span className="alert">{alert}</span>}
            <div className="login">
                {session?.authenticated ? (
                    <div>
                        <span>Welcome, {session.email}!</span>
                        {self && <span>{self.hasAdmin ? 'You are an admin' : 'You are not an admin'}</span>}
                    </div>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input disabled={!session} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <input type="password" placeholder={resetHash ? "New password" : "Password"} disabled={!session} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <button type="submit" disabled={!session}>{resetHash ? 'Reset password' : 'Login'}</button>
                        <button disabled={!session} onClick={handlePasswordReset}>Forgot password</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default App;
