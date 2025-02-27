import React, { useState } from 'react';
import axios from 'axios';
import './MultiStudent.css';

function MultiStudent() {
    const [files, setFiles] = useState([]);
    const [processType, setProcessType] = useState('graduationChecker');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
        setError(null);
    };

    const handleProcessTypeChange = (event) => {
        setProcessType(event.target.value);
    };

    const handleUpload = async () => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            let response;
            if (processType === 'graduationChecker') {
                response = await axios.post('/upload-folder', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                const gradResponse = await axios.get('/check-graduation');
                setResults(gradResponse.data);
            } else {
                response = await axios.post('/upload-folder', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setResults(response.data);
            }
        } catch (error) {
            setError('Error uploading files: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderResults = () => {
        if (!results) return null;

        if (processType === 'graduationChecker') {
            return (
                <div className="results-container">
                    <h3>Graduation Checker Results</h3>
                    {Object.entries(results).map(([filename, data]) => (
                        <div key={filename} className="result-card">
                            <h4>{filename}</h4>
                            <div className="requirements-section">
                                {data.progress?.["Student Progress"] && 
                                    Object.entries(data.progress["Student Progress"]).map(([req, status]) => (
                                        <div key={req} className={`requirement ${status.includes('✅') ? 'met' : 'not-met'}`}>
                                            {status}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="overall-status">
                                Overall Status: {data.met_all_requirements ? '✅ All Requirements Met' : '❌ Some Requirements Not Met'}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="results-container">
                    <h3>Other Option Results</h3>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                </div>
            );
        }
    };

    return (
        <div className="multi-student">
            <h2>Multi-Student Transcript Processing</h2>
            <input type="file" multiple webkitdirectory="true" onChange={handleFileChange} />
            <div className="process-options">
                <label>
                    <input
                        type="radio"
                        value="graduationChecker"
                        checked={processType === 'graduationChecker'}
                        onChange={handleProcessTypeChange}
                    />
                    Graduation Checker
                </label>
                <label>
                    <input
                        type="radio"
                        value="otherOption"
                        checked={processType === 'otherOption'}
                        onChange={handleProcessTypeChange}
                    />
                    Other Option
                </label>
            </div>
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Processing...' : 'Upload Folder'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {renderResults()}
        </div>
    );
}

export default MultiStudent;
