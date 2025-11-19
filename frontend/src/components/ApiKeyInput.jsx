import React, { useState } from 'react';

const ApiKeyInput = ({ onApiKeySet, sessionId }) => {
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/set-api-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    session_id: sessionId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to set API key');
            }

            const data = await response.json();
            setSuccess(true);
            onApiKeySet(data.session_id);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>🔑 OpenAI API Key</h2>
            <p className="card-description">
                Enter your OpenAI API key to enable text-to-SQL conversion
            </p>

            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">API key set successfully!</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="apiKey">API Key</label>
                    <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        disabled={loading || success}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || success}
                >
                    {loading ? (
                        <>
                            Setting API Key
                            <span className="loading"></span>
                        </>
                    ) : success ? (
                        '✓ API Key Set'
                    ) : (
                        'Set API Key'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ApiKeyInput;
