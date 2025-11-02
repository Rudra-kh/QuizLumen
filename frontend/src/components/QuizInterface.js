import React, { useState, useEffect } from 'react';
import contractService from '../services/contractService';

const mockQuestions = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2
    },
    {
        id: 2,
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1
    },
    {
        id: 3,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
    },
    {
        id: 4,
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
        correctAnswer: 2
    },
    {
        id: 5,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctAnswer: 3
    }
];

const QuizInterface = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [questions, setQuestions] = useState(mockQuestions);
    const [quizTitle, setQuizTitle] = useState('Default Quiz');
    const [loadingQuiz, setLoadingQuiz] = useState(true);

    // Load quiz from URL parameter if available
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('quiz');
        
        if (quizId) {
            // Load quiz from localStorage
            const savedQuiz = localStorage.getItem(quizId);
            if (savedQuiz) {
                try {
                    const quizData = JSON.parse(savedQuiz);
                    setQuestions(quizData.questions);
                    setQuizTitle(quizData.title);
                    console.log('✅ Loaded custom quiz:', quizData.title);
                } catch (error) {
                    console.error('Error loading quiz:', error);
                    setError('Failed to load custom quiz. Using default questions.');
                }
            } else {
                setError('Quiz not found. Using default questions.');
            }
        }
        setLoadingQuiz(false);
    }, []);

    const handleAnswer = (questionId, answerIndex) => {
        setAnswers({
            ...answers,
            [questionId]: answerIndex
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            await contractService.submitAnswers(answers);
            setSubmitted(true);
        } catch (error) {
            setError('Failed to submit answers: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingQuiz) {
        return (
            <div className="quiz-interface">
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="quiz-interface">
                <h2>Quiz Completed!</h2>
                <p>Your answers have been submitted successfully for <strong>{quizTitle}</strong>.</p>
                <p>Check the leaderboard to see results once the quiz ends.</p>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="quiz-interface">
            <h2>{quizTitle}</h2>
            
            <div className="question-navigation">
                {questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`nav-button ${currentQuestion === index ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <div className="question-container">
                <h3>Question {currentQuestion + 1} of {questions.length}</h3>
                <p>{question.question}</p>

                <div className="options">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(question.id, index)}
                            className={`option ${answers[question.id] === index ? 'selected' : ''}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="navigation-buttons">
                    {currentQuestion > 0 && (
                        <button onClick={() => setCurrentQuestion(curr => curr - 1)}>
                            Previous
                        </button>
                    )}
                    
                    {currentQuestion < questions.length - 1 ? (
                        <button onClick={() => setCurrentQuestion(curr => curr + 1)}>
                            Next
                        </button>
                    ) : (
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}
        </div>
    );
};

export default QuizInterface;