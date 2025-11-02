import React, { useState, useEffect } from 'react';
import contractService from '../services/contractService';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            setError('');
            
            const data = await contractService.getLeaderboard();
            // Ensure we store a plain array
            const normalized = Array.isArray(data) ? data : [];
            setLeaderboard(normalized);
        } catch (error) {
            setError('Failed to fetch leaderboard: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading leaderboard...</div>;
    }

    if (error) {
        return (
            <div className="error-message">
                {error}
                <button onClick={fetchLeaderboard}>Retry</button>
            </div>
        );
    }

    return (
        <div className="leaderboard">
            <h2>Quiz Leaderboard</h2>
            
            {(!Array.isArray(leaderboard) || leaderboard.length === 0) ? (
                <p>No results available yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Address</th>
                            <th>Score</th>
                            <th>Prize</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) => {
                            let address = '';
                            let score = '';
                            if (Array.isArray(entry)) {
                                address = entry[0];
                                score = entry[1];
                            } else if (entry && typeof entry === 'object') {
                                address = entry[0] || entry.address || Object.values(entry)[0];
                                score = entry[1] || entry.score || Object.values(entry)[1];
                            } else {
                                address = String(entry);
                            }

                            return (
                                <tr key={String(address) + index} className={index < 3 ? 'winner' : ''}>
                                    <td>{index + 1}</td>
                                    <td>{address}</td>
                                    <td>{score}</td>
                                    <td>
                                        {index === 0 ? '50%' : 
                                         index === 1 ? '30%' : 
                                         index === 2 ? '20%' : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            
            <button onClick={fetchLeaderboard} className="refresh-button">
                Refresh Leaderboard
            </button>
        </div>
    );
};

export default Leaderboard;