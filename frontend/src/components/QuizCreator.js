import React, { useState } from 'react';

const QuizCreator = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'file'
    const [quizId, setQuizId] = useState('');
    const [shareLink, setShareLink] = useState('');

    // Manual question creation
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                
                // Try to parse as JSON first
                try {
                    const jsonQuestions = JSON.parse(content);
                    setQuestions(jsonQuestions);
                    alert(`✅ Loaded ${jsonQuestions.length} questions from JSON file!`);
                    return;
                } catch (jsonError) {
                    // If not JSON, try to extract from JS file
                    const match = content.match(/const\s+\w+Questions\s*=\s*(\[[\s\S]*?\]);/);
                    if (match) {
                        const questionsArray = eval(match[1]);
                        setQuestions(questionsArray);
                        alert(`✅ Loaded ${questionsArray.length} questions from JS file!`);
                    } else {
                        alert('❌ Could not parse questions. Please use JSON format or valid JS array.');
                    }
                }
            } catch (error) {
                alert('❌ Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    const handleAddQuestion = () => {
        if (!currentQuestion.question.trim()) {
            alert('Please enter a question');
            return;
        }
        if (currentQuestion.options.some(opt => !opt.trim())) {
            alert('Please fill all options');
            return;
        }

        const newQuestion = {
            id: questions.length + 1,
            question: currentQuestion.question,
            options: [...currentQuestion.options],
            correctAnswer: currentQuestion.correctAnswer
        };

        setQuestions([...questions, newQuestion]);
        
        // Reset form
        setCurrentQuestion({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        });
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleCreateQuiz = () => {
        if (!quizTitle.trim()) {
            alert('Please enter a quiz title');
            return;
        }
        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        // Generate unique quiz ID
        const newQuizId = 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Save to localStorage (in production, this would be saved to backend/blockchain)
        const quizData = {
            id: newQuizId,
            title: quizTitle,
            questions: questions,
            createdAt: new Date().toISOString(),
            participants: []
        };
        
        localStorage.setItem(newQuizId, JSON.stringify(quizData));
        
        // Generate share link
        const link = `${window.location.origin}?quiz=${newQuizId}`;
        
        setQuizId(newQuizId);
        setShareLink(link);
    };

    const handleDownloadTemplate = () => {
        const template = [
            {
                id: 1,
                question: "Your question here?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
            },
            {
                id: 2,
                question: "Another question?",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswer: 1
            }
        ];

        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz-template.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadQuestions = () => {
        const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quizTitle.replace(/\s+/g, '_')}_questions.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    return (
        <div className="quiz-creator" style={{
            background: 'linear-gradient(135deg, #FFF9E2 0%, #FEECD0 100%)',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(220, 162, 120, 0.15)',
            marginBottom: '24px'
        }}>
            <h2 style={{color: '#DCA278', marginTop: 0}}>🎨 Create Your Quiz</h2>

            {!quizId ? (
                <>
                    {/* Quiz Title */}
                    <div style={{marginBottom: '24px'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#DCA278'}}>
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            placeholder="Enter quiz title..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '2px solid #EBECCC',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {/* Upload Method Selection */}
                    <div style={{marginBottom: '24px'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#DCA278'}}>
                            How do you want to add questions?
                        </label>
                        <div style={{display: 'flex', gap: '12px'}}>
                            <button
                                onClick={() => setUploadMethod('manual')}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: uploadMethod === 'manual' ? '#DCA278' : '#EBECCC',
                                    color: uploadMethod === 'manual' ? 'white' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                ✍️ Create Manually
                            </button>
                            <button
                                onClick={() => setUploadMethod('file')}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: uploadMethod === 'file' ? '#DCA278' : '#EBECCC',
                                    color: uploadMethod === 'file' ? 'white' : '#666',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                📁 Upload File
                            </button>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    {uploadMethod === 'file' && (
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            border: '2px dashed #DCA278'
                        }}>
                            <h3 style={{marginTop: 0, color: '#DCA278'}}>📤 Upload Questions File</h3>
                            <p style={{color: '#666', fontSize: '14px'}}>
                                Upload a JSON file or JavaScript file containing your quiz questions
                            </p>
                            
                            <input
                                type="file"
                                accept=".json,.js"
                                onChange={handleFileUpload}
                                style={{marginBottom: '12px'}}
                            />

                            <div style={{marginTop: '16px'}}>
                                <button
                                    onClick={handleDownloadTemplate}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#CDD4B1',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    📥 Download Template
                                </button>
                            </div>

                            {questions.length > 0 && (
                                <div style={{marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '8px'}}>
                                    <strong style={{color: '#DCA278'}}>✅ {questions.length} questions loaded!</strong>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Question Creation */}
                    {uploadMethod === 'manual' && (
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{marginTop: 0, color: '#DCA278'}}>➕ Add Question</h3>
                            
                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Question</label>
                                <input
                                    type="text"
                                    value={currentQuestion.question}
                                    onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                                    placeholder="Enter your question..."
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #EBECCC'
                                    }}
                                />
                            </div>

                            {currentQuestion.options.map((option, index) => (
                                <div key={index} style={{marginBottom: '12px'}}>
                                    <label style={{display: 'block', marginBottom: '4px', fontSize: '14px'}}>
                                        Option {index + 1}
                                        {currentQuestion.correctAnswer === index && (
                                            <span style={{color: '#48bb78', marginLeft: '8px'}}>✓ Correct Answer</span>
                                        )}
                                    </label>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...currentQuestion.options];
                                                newOptions[index] = e.target.value;
                                                setCurrentQuestion({...currentQuestion, options: newOptions});
                                            }}
                                            placeholder={`Option ${index + 1}...`}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '6px',
                                                border: '1px solid #EBECCC'
                                            }}
                                        />
                                        <button
                                            onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: currentQuestion.correctAnswer === index ? '#48bb78' : '#EBECCC',
                                                color: currentQuestion.correctAnswer === index ? 'white' : '#666',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Set Correct
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddQuestion}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#DCA278',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    marginTop: '12px'
                                }}
                            >
                                ➕ Add Question
                            </button>
                        </div>
                    )}

                    {/* Questions List */}
                    {questions.length > 0 && (
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{marginTop: 0, color: '#DCA278'}}>📝 Questions ({questions.length})</h3>
                            {questions.map((q, index) => (
                                <div key={index} style={{
                                    padding: '12px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    borderLeft: '4px solid #DCA278'
                                }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                        <div style={{flex: 1}}>
                                            <strong>{index + 1}. {q.question}</strong>
                                            <ul style={{margin: '8px 0', paddingLeft: '20px'}}>
                                                {q.options.map((opt, i) => (
                                                    <li key={i} style={{
                                                        color: i === q.correctAnswer ? '#48bb78' : '#666',
                                                        fontWeight: i === q.correctAnswer ? '600' : 'normal'
                                                    }}>
                                                        {opt} {i === q.correctAnswer && '✓'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveQuestion(index)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: '#ff6b6b',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleDownloadQuestions}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#CDD4B1',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    marginTop: '8px'
                                }}
                            >
                                💾 Download Questions
                            </button>
                        </div>
                    )}

                    {/* Create Quiz Button */}
                    {questions.length > 0 && (
                        <button
                            onClick={handleCreateQuiz}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #DCA278, #CDD4B1)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '18px',
                                boxShadow: '0 4px 15px rgba(220, 162, 120, 0.3)'
                            }}
                        >
                            🚀 Create Quiz & Get Share Link
                        </button>
                    )}
                </>
            ) : (
                // Quiz Created - Show Share Link
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <h3 style={{color: '#48bb78', marginTop: 0}}>✅ Quiz Created Successfully!</h3>
                    <p style={{fontSize: '18px', fontWeight: '600', color: '#DCA278', margin: '16px 0'}}>
                        {quizTitle}
                    </p>
                    <p style={{color: '#666'}}>Share this link with participants:</p>
                    
                    <div style={{
                        background: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginTop: '16px',
                        marginBottom: '16px',
                        wordBreak: 'break-all'
                    }}>
                        <code style={{color: '#DCA278', fontSize: '14px'}}>{shareLink}</code>
                    </div>

                    <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <button
                            onClick={() => copyToClipboard(shareLink)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#DCA278',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            📋 Copy Link
                        </button>
                        <button
                            onClick={() => copyToClipboard(quizId)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#CDD4B1',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            🔑 Copy Quiz ID
                        </button>
                        <button
                            onClick={() => {
                                setQuizId('');
                                setShareLink('');
                                setQuestions([]);
                                setQuizTitle('');
                            }}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#EBECCC',
                                color: '#666',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ➕ Create Another Quiz
                        </button>
                    </div>

                    <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: '#fff3cd',
                        borderRadius: '8px',
                        textAlign: 'left'
                    }}>
                        <strong style={{color: '#856404'}}>💡 Next Steps:</strong>
                        <ol style={{margin: '8px 0', paddingLeft: '20px', color: '#856404'}}>
                            <li>Share the link with participants</li>
                            <li>Participants will answer the questions</li>
                            <li>Check the leaderboard to see results</li>
                            <li>Winners will receive prizes automatically!</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizCreator;
