import React, { useState } from 'react';
import contractService from '../services/contractService';

const Registration = ({ onRegistered }) => {
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            setRegistering(true);
            setError('');
            
            await contractService.registerForQuiz();
            onRegistered(true);
        } catch (error) {
            setError('Failed to register: ' + error.message);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="registration">
            <h2>Quiz Registration</h2>
            <p>Registration fee: 10 XLM</p>
            
            <button 
                onClick={handleRegister} 
                disabled={registering}
            >
                {registering ? 'Registering...' : 'Register for Quiz'}
            </button>
            
            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Registration;