import React, { useState, useEffect, FormEvent } from "react";
import { IPTSortOption, IPTResult } from '../../types/shared';

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
    const [trackerLoading, setTrackerLoading ] = useState<boolean>(false);
    const [trackerSearch, setTrackerSearch] = useState<string>('');
    const [trackerOffset, setTrackerOffset] = useState<number>(0);

    const search = new URLSearchParams(location.search);
    const passwordReset = search.get('passwordReset');

    const fetchSession = async () => {
        setAlert(null);
        const result = await api.getSession();
        setSession(result);
    };

    const handleLogin = async (e: FormEvent) => {
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

    const handlePasswordReset = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await api.requestPasswordReset(email)
            setAlert('Password reset email sent');
        } catch(err) {
            setAlert((err as Error).message);
        }
    };

    const handleSearchTracker = async (e: FormEvent) => {
        e.preventDefault();
        setTrackerLoading(true);

        try {
            const result = await api.searchTracker(trackerSearch, undefined, trackerOffset) as { pageCount: number; results: IPTResult };
            console.log(result);
        } catch(err) {
            setAlert((err as Error).message);
        } finally {
            setTrackerLoading(false);
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

            <div className="tracker">
                <form onSubmit={handleSearchTracker}>
                    <input placeholder="Search for a torrent" value={trackerSearch} onChange={(e) => setTrackerSearch(e.target.value)}/>
                </form>
                {trackerLoading ? (<span>Loading...</span>) : null}
            </div>
        </div>
    );
}

export default App;
