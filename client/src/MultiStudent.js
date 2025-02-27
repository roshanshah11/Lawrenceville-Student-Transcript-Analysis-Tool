import React, { useState } from 'react';
import axios from 'axios';
import './MultiStudent.css';

const MultiStudent = () => {
    const [files, setFiles] = useState([]);
    const [processType, setProcessType] = useState('individual');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
        setError(null);
    };

    const handleProcessTypeChange = (e) => {
        setProcessType(e.target.value);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (files.length === 0) {
        setError('No files selected.');
        setLoading(false);
        return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
        let response;
        if (processType === 'individual') {
            response = await axios.post('http://localhost:5000/upload-multi-student', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                const gradResponse = await axios.get('http://localhost:5000/check-graduation');
                setResults(gradResponse.data);
            } else {
                setError('Failed to upload files.');
            }
        } else {
            response = await axios.post('http://localhost:5000/upload-multi-student', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                const imageResponse = await axios.get('http://localhost:5000/chart', {
                    responseType: 'blob',
                });

                const imageUrl = URL.createObjectURL(imageResponse.data);
                setResults(imageUrl);
            } else {
                setError('Failed to upload files.');
            }
        }
    } catch (err) {
        console.error('Error during file processing:', err);
        setError(err.response?.data?.error || 'An error occurred while processing files');
    } finally {
        setLoading(false);
    }
};


    const toggleCard = (filename) => {
        setExpandedCards(prevState => ({
            ...prevState,
            [filename]: !prevState[filename]
        }));
    };

    const renderResults = () => {
        if (!results) return null;
    
        if (processType === 'individual') {
            return (
                <div className="results-container">
                    <h3>Individual Results</h3>
                    {Object.entries(results).map(([filename, data]) => {
                        const parts = filename.split("_");
                        const isExpanded = expandedCards[filename];
    
                        return (
                            <div 
                                key={filename} 
                                className={`result-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleCard(filename)}
                            >
                                <h4>{parts}</h4>
                                <div className="graduation-status">
                                    <strong>Graduation Status:</strong>{" "}
                                    {data.graduation_check.met_all_requirements ? (
                                        <span className="status-met">✅ All Requirements Met</span>
                                    ) : (
                                        <span className="status-not-met">❌ Some Requirements Not Met</span>
                                    )}
                                </div>
    
                                {isExpanded && (
                                    <div className="additional-data">
                                        <div className="progress-section">
                                            <h5>Progress</h5>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Requirement</th>
                                                        <th>Status</th>
                                                        <th>Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(data.graduation_check.progress["Student Progress"]).map(([req, status]) => {
                                                        const isMet = status.includes('✅');
                                                        const progressText = status.split(":")[1].trim();
                                                        return (
                                                            <tr key={req} className={isMet ? "met" : "not-met"}>
                                                                <td>{req}</td>
                                                                <td>{isMet ? "✅ Met" : "❌ Not Met"}</td>
                                                                <td>{progressText}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
    
                                        <div className="requirements-section">
                                            <h5>Graduation Requirements</h5>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Requirement</th>
                                                        <th>Credits Needed</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(data.graduation_check.requirements["Graduation Requirements"]).map(([req, credits]) => (
                                                        <tr key={req}>
                                                            <td>{req}</td>
                                                            <td>{credits}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return (
                <div className="results-container">
                    <h3>Collective Analysis</h3>
                    {results ? (
                        <img src={results} alt="GPA Distribution Histogram" className="results-image" />
                    ) : (
                        <p>No data available.</p>
                    )}
                </div>
            );
        }
    };
    

    return (
        <div className="multi-student-container">
            <h2>Multi-Student Transcript Processing</h2>
            
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="file-input-section">
                    <label htmlFor="transcript-files">Select Transcript Folder:</label>
                    <input
                        type="file"
                        id="transcript-files"
                        webkitdirectory="true"
                        directory="true"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                </div>

                <div className="process-options">
                    <label>
                        <input
                            type="radio"
                            value="individual"
                            checked={processType === 'individual'}
                            onChange={handleProcessTypeChange}
                        />
                        Process Individually
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="collective"
                            checked={processType === 'collective'}
                            onChange={handleProcessTypeChange}
                        />
                        Process Collectively
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={files.length === 0 || loading}
                    className="submit-button"
                >
                    {loading ? 'Processing...' : 'Process Files'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}
            {renderResults()}
        </div>
    );
};

export default MultiStudent;

