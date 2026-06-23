import React, { useState, useEffect } from "react";

import * as api from './api';

interface SessionData {
    email?: string;
    authenticated: boolean;
}

function App() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const fetchSession = async () => {
        const result = await api.session();
        setSession(result);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setSession(null);
        try {
            const result = await api.login(email, password);
        } catch(err) {
            setError((err as Error).message);
        } finally {
            fetchSession();
        }
    }

    useEffect(() => {
        fetchSession();
    }, []);

    return (
        <div className="main">
            {error && <span className="error">Error: {error}</span>}
            <div className="login">
                {session?.authenticated ? (
                    <span>Welcome, {session.email}!</span>
                ) : (
                    <form onSubmit={handleLogin}>
                        <input disabled={!session} placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <input type="password" disabled={!session} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <button type="submit" disabled={!session}>Login</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default App;
