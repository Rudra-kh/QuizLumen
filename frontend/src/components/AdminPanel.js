import React, { useState, useEffect } from 'react';
import { getPublicKey } from '@stellar/freighter-api';
import contractService from '../services/contractService';

const AdminPanel = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quizState, setQuizState] = useState(null);

    useEffect(() => {
        // sequence: check admin first, then fetch quiz state only if contract is configured
        (async () => {
            await checkAdminStatus();
            // only attempt fetching quiz state if contract id is configured
            if (process.env.REACT_APP_CONTRACT_ID) {
                await fetchQuizState();
            } else {
                setError('Frontend is not configured: REACT_APP_CONTRACT_ID is missing. See readme2.md.');
            }
        })();
    }, []);

    const checkAdminStatus = async () => {
        try {
            const publicKey = await getPublicKey();
            // In production you'd compare publicKey to stored admin key (contract admin)
            // For now assume the connected user is admin if any key is present
            setIsAdmin(!!publicKey);
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    };

    const fetchQuizState = async () => {
        try {
            const state = await contractService.getQuizState();
            setQuizState(state);
        } catch (error) {
            // surface friendly error messages (contractService now throws clear errors when config missing)
            setError('Failed to fetch quiz state: ' + (error.message || error));
        }
    };

    const startQuiz = async () => {
        try {
            setLoading(true);
            setError('');
            await contractService.startQuiz();
            await fetchQuizState();
        } catch (error) {
            setError('Failed to start quiz: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const endQuiz = async () => {
        try {
            setLoading(true);
            setError('');
            await contractService.endQuiz();
            await fetchQuizState();
        } catch (error) {
            setError('Failed to end quiz: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    const distributePrizes = async () => {
        try {
            setLoading(true);
            setError('');
            await contractService.distributePrizes();
            await fetchQuizState();
        } catch (error) {
            setError('Failed to distribute prizes: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            
            <div className="quiz-state">
                <h3>Current Quiz State: {quizState}</h3>
            </div>
            
            <div className="admin-controls">
                <button 
                    onClick={startQuiz}
                    disabled={loading || quizState !== 'Pending'}
                >
                    Start Quiz
                </button>
                
                <button 
                    onClick={endQuiz}
                    disabled={loading || quizState !== 'Open'}
                >
                    End Quiz
                </button>
                
                <button 
                    onClick={distributePrizes}
                    disabled={loading || quizState !== 'Closed'}
                >
                    Distribute Prizes
                </button>
            </div>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AdminPanel;