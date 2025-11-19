import React, { useState, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import SchemaUpload from './components/SchemaUpload';
import QueryInput from './components/QueryInput';
import QueryResult from './components/QueryResult';
import QueryHistory from './components/QueryHistory';

function App() {
    const [sessionId, setSessionId] = useState(null);
    const [schemaLoaded, setSchemaLoaded] = useState(false);
    const [currentResult, setCurrentResult] = useState(null);
    const [history, setHistory] = useState([]);

    // Fetch history when session is established
    useEffect(() => {
        if (sessionId) {
            fetchHistory();
        }
    }, [sessionId]);

    const fetchHistory = async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(`/api/history/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setHistory(data.history);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const handleApiKeySet = (newSessionId) => {
        setSessionId(newSessionId);
    };

    const handleSchemaUploaded = () => {
        setSchemaLoaded(true);
    };

    const handleQuerySubmit = (result) => {
        setCurrentResult(result);
        // Add to history at the beginning
        setHistory(prev => [result, ...prev.slice(0, 4)]);
    };

    return (
        <div className="app">
            <header className="header">
                <h1>Text to SQL Converter</h1>
                <p>Transform natural language into powerful SQL queries with AI</p>
            </header>

            <main>
                <div className="main-grid">
                    <ApiKeyInput
                        onApiKeySet={handleApiKeySet}
                        sessionId={sessionId}
                    />
                    <SchemaUpload
                        sessionId={sessionId}
                        onSchemaUploaded={handleSchemaUploaded}
                    />
                </div>

                <QueryInput
                    sessionId={sessionId}
                    schemaLoaded={schemaLoaded}
                    onQuerySubmit={handleQuerySubmit}
                />

                {currentResult && <QueryResult result={currentResult} />}

                <QueryHistory history={history} />
            </main>

            <footer style={{
                textAlign: 'center',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
            }}>
                <p>Powered by OpenAI GPT-4 and LangChain</p>
            </footer>
        </div>
    );
}

export default App;
