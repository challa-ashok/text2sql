import React, { useState } from 'react';

const QueryResult = ({ result }) => {
    const [copied, setCopied] = useState(false);

    if (!result) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.sql_query);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="query-result">
            <div className="query-result-header">
                <h3>✨ Generated SQL Query</h3>
                <span className="query-result-timestamp">
                    {formatTimestamp(result.timestamp)}
                </span>
            </div>

            <div className="query-question">
                <p><strong>Question:</strong> {result.question}</p>
            </div>

            <div className="sql-code">
                <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
                <pre>{result.sql_query}</pre>
            </div>
        </div>
    );
};

export default QueryResult;
