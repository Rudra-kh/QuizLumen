import React, { useState, useEffect, useRef, useCallback } from 'react';

// WalletConnect: robust Freighter detection + connect UI
// Tries multiple detection strategies and provides retry/helpful messages.

const WalletConnect = () => {
    const [connected, setConnected] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [freighterFound, setFreighterFound] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const detectRef = useRef(null);

    // Helper: check known globals where Freighter might be exposed
    const detectFreighterGlobal = useCallback(() => {
        if (typeof window === 'undefined') return false;
        if (typeof window.freighter !== 'undefined') return true;
        if (typeof window.freighterApi !== 'undefined') return true;
        if (typeof window.freighterApiClient !== 'undefined') return true;
        if (typeof window.Freighter !== 'undefined') return true;
        return false;
    }, []);

    // Poll for freighter injection (timeout by default 30s)
    const waitForFreighter = useCallback((timeoutMs = 30000, intervalMs = 500) => {
        return new Promise((resolve) => {
            const start = Date.now();
            setDetecting(true);
            detectRef.current = setInterval(() => {
                const found = detectFreighterGlobal();
                if (found) {
                    clearInterval(detectRef.current);
                    setDetecting(false);
                    setFreighterFound(true);
                    resolve(true);
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(detectRef.current);
                    setDetecting(false);
                    setFreighterFound(false);
                    resolve(false);
                }
            }, intervalMs);
        });
    }, [detectFreighterGlobal]);

    // Try to get public key from available provider globals
    const getPublicKeyFromProvider = useCallback(async () => {
        try {
            if (typeof window !== 'undefined' && window.freighter && typeof window.freighter.getPublicKey === 'function') {
                return await window.freighter.getPublicKey();
            }
            if (typeof window !== 'undefined' && window.freighterApi && typeof window.freighterApi.getPublicKey === 'function') {
                return await window.freighterApi.getPublicKey();
            }
            if (typeof window !== 'undefined' && window.freighterApiClient && typeof window.freighterApiClient.getPublicKey === 'function') {
                return await window.freighterApiClient.getPublicKey();
            }
            if (typeof window !== 'undefined' && window.Freighter && typeof window.Freighter.getPublicKey === 'function') {
                return await window.Freighter.getPublicKey();
            }
        } catch (err) {
            // propagate error to caller so UI can handle
            throw err;
        }
        return null;
    }, []);

    const fetchBalance = async (pubKey) => {
        try {
            const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
            if (!res.ok) {
                setBalance('Account not found / not funded');
                return;
            }
            const account = await res.json();
            const xlm = account.balances && account.balances.find((b) => b.asset_type === 'native');
            setBalance(xlm ? xlm.balance : '0');
        } catch (err) {
            console.error('fetchBalance error', err);
            setBalance('Error loading balance');
        }
    };

    const connectHandler = async () => {
        setError('');
        setLoading(true);
        try {
            // Try provider call first (must be user gesture to avoid popup block)
            const pk = await getPublicKeyFromProvider();
            if (pk) {
                setPublicKey(pk);
                setConnected(true);
                await fetchBalance(pk);
                setLoading(false);
                return;
            }

            // Fallback: try dynamic import of @stellar/freighter-api
            try {
                // eslint-disable-next-line import/no-extraneous-dependencies
                const mod = await import('@stellar/freighter-api');
                const FreighterApi = mod && (mod.default || mod.FreighterApi || mod.Freighter);
                if (FreighterApi) {
                    try {
                        const inst = new FreighterApi();
                        if (typeof inst.getPublicKey === 'function') {
                            const pk2 = await inst.getPublicKey();
                            if (pk2) {
                                setPublicKey(pk2);
                                setConnected(true);
                                await fetchBalance(pk2);
                                setLoading(false);
                                return;
                            }
                        }
                    } catch (e) {
                        console.warn('freighter-api instance call failed', e);
                    }
                }
            } catch (importErr) {
                console.info('dynamic import of @stellar/freighter-api failed or not available', importErr && importErr.message);
            }

            setError('Freighter provider did not respond. Make sure the Freighter extension is installed, allowed for this site, and unlocked.');
        } catch (err) {
            setError(err && err.message ? `Connection error: ${err.message}` : 'Unknown connection error');
        } finally {
            setLoading(false);
        }
    };

    const disconnectHandler = () => {
        setConnected(false);
        setPublicKey('');
        setBalance(null);
        setError('');
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            const ok = await waitForFreighter(30000, 500);
            if (!mounted) return;
            setFreighterFound(ok);
            // Do not silently call getPublicKey here — require user gesture to connect.
        })();

        return () => {
            mounted = false;
            if (detectRef.current) clearInterval(detectRef.current);
        };
    }, [waitForFreighter]);

    const retryDetection = async () => {
        setError('');
        const ok = await waitForFreighter(30000, 500);
        setFreighterFound(ok);
        if (!ok) setError('Freighter not detected after retry. Make sure the extension is installed and the page was reloaded after install.');
    };

    // Note: debug helpers removed to simplify UI. Use browser devtools if deeper inspection is needed.

    return (
        <div className="wallet-connect">
            <h2>🔐 Wallet</h2>

            {!connected ? (
                <div>
                    <p style={{ marginBottom: 12, color: '#666' }}>Connect your Freighter wallet to participate.</p>

                    {!freighterFound && (
                        <div style={{ marginBottom: 12, background: '#fff3cd', color: '#856404', padding: 12, borderRadius: 8 }}>
                            <strong>⚠️ Freighter Not Detected</strong>
                            <p style={{ margin: '8px 0 0 0', fontSize: 13 }}>
                                If you just installed Freighter, reload this page and click <strong>Retry detection</strong>. Try a different browser (Chrome/Edge) if using Brave.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <button
                            onClick={connectHandler}
                            disabled={loading}
                            style={{ flex: 1, background: freighterFound ? '#DCA278' : '#ccc', color: 'white', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                        >
                            {loading ? '🔄 Connecting…' : '🔗 Connect Freighter'}
                        </button>

                        <button onClick={retryDetection} disabled={detecting} style={{ padding: 10, borderRadius: 8, border: '1px solid #EBECCC', background: detecting ? '#EBECCC' : 'white', cursor: 'pointer' }}>
                            {detecting ? 'Searching…' : 'Retry detection'}
                        </button>
                    </div>

                    <div style={{ fontSize: 13, color: '#666' }}>
                        <p style={{ margin: '6px 0' }}>
                            <strong>Quick checks:</strong>
                        </p>
                        <ul>
                            <li>Reload the page after installing Freighter.</li>
                            <li>Use the same browser profile where Freighter is installed.</li>
                            <li>Disable shields/ad-blockers or try Chrome/Edge instead of Brave.</li>
                            <li>Ensure the extension has site access and popups are allowed.</li>
                        </ul>
                    </div>

                    {error && (
                        <div style={{ marginTop: 12, padding: 10, background: '#fee', color: '#c33', borderRadius: 8 }}>{error}</div>
                    )}
                </div>
            ) : (
                <div>
                    <p style={{ color: '#48bb78', fontWeight: 600, marginBottom: 10 }}>✅ Connected</p>
                    <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                        <p style={{ marginBottom: 6 }}>
                            <strong>Public Key:</strong>
                        </p>
                        <code style={{ fontSize: 12, wordBreak: 'break-all', background: 'white', padding: 8, borderRadius: 4, display: 'block' }}>{publicKey}</code>
                        <p style={{ marginTop: 10, marginBottom: 6 }}>
                            <strong>Balance:</strong>
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#DCA278' }}>{balance || 'Loading...'} XLM</p>
                    </div>

                    <button onClick={disconnectHandler} style={{ background: '#666', color: 'white', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', width: '100%' }}>
                        🔓 Disconnect
                    </button>
                </div>
            )}

            {/* Debug tools removed to simplify UI. Use browser devtools for inspection if needed. */}

            <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                <strong>Dev note:</strong> Freighter injects into pages served via HTTP/HTTPS. Use the dev server (npm start) and open <a href="http://localhost:3000">http://localhost:3000</a>. Do not open files via file://
            </div>
        </div>
    );
};

export default WalletConnect;