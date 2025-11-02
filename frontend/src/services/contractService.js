import * as StellarSdk from 'stellar-sdk';

// Support both CommonJS and ESM builds of the SDK (some packages expose a default)
const Sdk = (StellarSdk && StellarSdk.default) ? StellarSdk.default : StellarSdk;

// Wait for Freighter to load
const waitForFreighter = (timeout = 3000) => {
    return new Promise((resolve) => {
        if (window.freighter) {
            resolve(window.freighter);
            return;
        }

        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.freighter) {
                clearInterval(checkInterval);
                resolve(window.freighter);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkInterval);
                resolve(null);
            }
        }, 100);
    });
};

class ContractService {
    constructor() {
        const horizon = process.env.REACT_APP_HORIZON_URL || 'https://horizon-testnet.stellar.org';
        this.networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
        this.contractId = process.env.REACT_APP_CONTRACT_ID;
        this.horizon = horizon;
    }

    async getAccount(publicKey) {
        // Load account data directly from Horizon REST API to avoid relying on Server constructor in browser bundles
        const res = await fetch(`${this.horizon}/accounts/${encodeURIComponent(publicKey)}`);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to load account ${publicKey}: ${res.status} ${text}`);
        }
        return await res.json();
    }

    ensureContractId() {
        if (!this.contractId) {
            throw new Error('REACT_APP_CONTRACT_ID is not set. Set it in frontend/.env or the environment before using contract functions.');
        }
    }

    // Helper to submit a signed XDR to Horizon (works across SDK versions)
    async submitSignedXDR(signedXdr) {
        const horizon = process.env.REACT_APP_HORIZON_URL || 'https://horizon-testnet.stellar.org';
        const url = `${horizon}/transactions`;
        const body = `tx=${encodeURIComponent(signedXdr)}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Horizon error: ${res.status} ${text}`);
        }
        return await res.json();
    }

    async buildSignAndSubmit(account, operations = []) {
        const freighter = await waitForFreighter();
        if (!freighter) {
            throw new Error('Freighter wallet not found. Please install the extension.');
        }

        const txBuilder = new Sdk.TransactionBuilder(account, {
            fee: Sdk.BASE_FEE,
            networkPassphrase: this.networkPassphrase,
        });
        for (const op of operations) txBuilder.addOperation(op);
        const tx = txBuilder.setTimeout(30).build();

        const signedXdr = await freighter.signTransaction(tx.toXDR(), { networkPassphrase: this.networkPassphrase });
        return await this.submitSignedXDR(signedXdr);
    }

    async registerForQuiz() {
        try {
            this.ensureContractId();
            const freighter = await waitForFreighter();
            if (!freighter) {
                throw new Error('Freighter wallet not found.');
            }
            
            const publicKey = await freighter.getPublicKey();
            const account = await this.getAccount(publicKey);

            const contract = new Sdk.Contract(this.contractId);
            const op = contract.call('register', publicKey);

            return await this.buildSignAndSubmit(account, [op]);
        } catch (error) {
            console.error('Error registering for quiz:', error);
            throw error;
        }
    }

    async submitAnswers(answers) {
        try {
            this.ensureContractId();
            const freighter = await waitForFreighter();
            if (!freighter) {
                throw new Error('Freighter wallet not found.');
            }
            
            const publicKey = await freighter.getPublicKey();
            const account = await this.getAccount(publicKey);

            // Hash the answers
            const answersString = JSON.stringify(answers);
            const encoder = new TextEncoder();
            const data = encoder.encode(answersString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));

            const contract = new Sdk.Contract(this.contractId);
            const op = contract.call('submit_answers', publicKey, hashArray);

            return await this.buildSignAndSubmit(account, [op]);
        } catch (error) {
            console.error('Error submitting answers:', error);
            throw error;
        }
    }

    async getQuizState() {
        try {
            this.ensureContractId();
            const contract = new Sdk.Contract(this.contractId);
            const res = await contract.call('get_quiz_state');
            // Normalize enum/string-like returns to plain JS values
            try {
                if (res && typeof res.toString === 'function') return res.toString();
            } catch (e) {
                // ignore
            }
            return res;
        } catch (error) {
            console.error('Error getting quiz state:', error);
            throw error;
        }
    }

    async getLeaderboard() {
        try {
            this.ensureContractId();
            const contract = new Sdk.Contract(this.contractId);
            const res = await contract.call('get_leaderboard');
            return this._normalizeContractReturn(res);
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    // Normalize various contract return shapes (Vec, SDK wrappers, XDR-derived objects)
    _normalizeContractReturn(val) {
        if (val == null) return [];
        // If already a plain array
        if (Array.isArray(val)) return val;

        // SDK Vecs are sometimes iterable or provide toArray/toJSON
        try {
            if (typeof val.toArray === 'function') return val.toArray();
        } catch (e) {}
        try {
            if (typeof val.toJSON === 'function') return val.toJSON();
        } catch (e) {}

        try {
            // If it's iterable (like a Vec), Array.from may work
            const arr = Array.from(val);
            if (Array.isArray(arr)) return arr;
        } catch (e) {}

        // If it's an object with numeric keys or length property
        try {
            if (typeof val.length === 'number') {
                const out = [];
                for (let i = 0; i < val.length; i++) {
                    out.push(val[i]);
                }
                return out;
            }
        } catch (e) {}

        // Fallback: extract values from an object
        try {
            const entries = Object.entries(val || {});
            if (entries.length > 0) return entries.map(([k, v]) => v);
        } catch (e) {}

        // Last resort: return empty array
        return [];
    }

    // Admin functions
    async startQuiz() {
        try {
            this.ensureContractId();
            const freighter = await waitForFreighter();
            if (!freighter) {
                throw new Error('Freighter wallet not found.');
            }
            
            const adminKey = await freighter.getPublicKey();
            const account = await this.getAccount(adminKey);
            const contract = new Sdk.Contract(this.contractId);
            const op = contract.call('start_quiz', adminKey);
            return await this.buildSignAndSubmit(account, [op]);
        } catch (error) {
            console.error('Error starting quiz:', error);
            throw error;
        }
    }

    async endQuiz() {
        try {
            this.ensureContractId();
            const freighter = await waitForFreighter();
            if (!freighter) {
                throw new Error('Freighter wallet not found.');
            }
            
            const adminKey = await freighter.getPublicKey();
            const account = await this.getAccount(adminKey);
            const contract = new Sdk.Contract(this.contractId);
            const op = contract.call('end_quiz', adminKey);
            return await this.buildSignAndSubmit(account, [op]);
        } catch (error) {
            console.error('Error ending quiz:', error);
            throw error;
        }
    }

    async distributePrizes() {
        try {
            this.ensureContractId();
            const freighter = await waitForFreighter();
            if (!freighter) {
                throw new Error('Freighter wallet not found.');
            }
            
            const adminKey = await freighter.getPublicKey();
            const account = await this.getAccount(adminKey);
            const contract = new Sdk.Contract(this.contractId);
            const op = contract.call('distribute_prizes', adminKey);
            return await this.buildSignAndSubmit(account, [op]);
        } catch (error) {
            console.error('Error distributing prizes:', error);
            throw error;
        }
    }
}

export default new ContractService();