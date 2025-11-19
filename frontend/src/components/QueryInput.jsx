import React, { useState } from 'react';

const QueryInput = ({ sessionId, schemaLoaded, onQuerySubmit }) => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            setError('Please enter a question');
            return;
        }

        if (!sessionId || !schemaLoaded) {
            setError('Please set API key and upload schema first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    session_id: sessionId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to convert query');
            }

            const data = await response.json();
            onQuerySubmit(data);
            setQuestion('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card full-width">
            <h2>💬 Ask a Question</h2>
            <p className="card-description">
                Enter your question in natural language and get the SQL query
            </p>

            {error && <div className="status-message status-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="question">Your Question</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., Show me all movies from 2020 with ratings above 8"
                        disabled={loading || !sessionId || !schemaLoaded}
                        rows="4"
                    />
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.5rem',
                        textAlign: 'right'
                    }}>
                        {question.length} characters
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !sessionId || !schemaLoaded}
                >
                    {loading ? (
                        <>
                            Converting to SQL
                            <span className="loading"></span>
                        </>
                    ) : (
                        'Convert to SQL'
                    )}
                </button>
            </form>
        </div>
    );
};

export default QueryInput;
