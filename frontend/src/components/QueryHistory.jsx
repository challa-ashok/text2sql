import React from 'react';

const QueryHistory = ({ history }) => {
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    if (history.length === 0) {
        return (
            <div className="card full-width">
                <h2>📜 Query History</h2>
                <p className="card-description">Last 5 queries will appear here</p>
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-text">No queries yet. Start by asking a question!</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card full-width">
            <h2>📜 Query History</h2>
            <p className="card-description">Your last {history.length} queries</p>

            <div className="history-list">
                {history.map((item, index) => (
                    <div key={index} className="history-item">
                        <div className="history-item-question">
                            <strong>Q:</strong> {item.question}
                        </div>
                        <div className="history-item-sql">
                            {item.sql_query}
                        </div>
                        <div className="history-item-time">
                            {formatTimestamp(item.timestamp)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QueryHistory;
