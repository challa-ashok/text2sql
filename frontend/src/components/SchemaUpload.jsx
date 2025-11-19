import React, { useState } from 'react';

const SchemaUpload = ({ sessionId, onSchemaUploaded }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/json') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid JSON file');
            setFile(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/json') {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please drop a valid JSON file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        if (!sessionId) {
            setError('Please set API key first');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', sessionId);

        try {
            const response = await fetch(`/api/upload-schema?session_id=${sessionId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to upload schema');
            }

            const data = await response.json();
            setSuccess(true);
            onSchemaUploaded();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>📁 Database Schema</h2>
            <p className="card-description">
                Upload your database schema JSON file
            </p>

            {error && <div className="status-message status-error">{error}</div>}
            {success && <div className="status-message status-success">Schema uploaded successfully!</div>}

            <div
                className={`file-upload ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    disabled={loading || !sessionId}
                />
                <div className="file-upload-icon">📄</div>
                <div className="file-upload-text">
                    <strong>Click to browse</strong> or drag and drop<br />
                    JSON files only
                </div>
            </div>

            {file && (
                <div className="file-name">
                    📎 {file.name}
                </div>
            )}

            <button
                onClick={handleUpload}
                className="btn btn-primary"
                disabled={!file || loading || !sessionId || success}
                style={{ marginTop: '1rem', width: '100%' }}
            >
                {loading ? (
                    <>
                        Uploading Schema
                        <span className="loading"></span>
                    </>
                ) : success ? (
                    '✓ Schema Uploaded'
                ) : (
                    'Upload Schema'
                )}
            </button>
        </div>
    );
};

export default SchemaUpload;
