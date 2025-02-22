import React, { useState } from "react";
import axios from "axios";
import "./TranscriptUploader.css";

const TranscriptUploader = () => {
    const [file, setFile] = useState(null);
    const [grades, setGrades] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showGrades, setShowGrades] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file.");
            return;
        }

        setError("");
        setLoading(true);
        setShowGrades(false);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/extract-grades", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setGrades(response.data);
            setShowGrades(true);
        } catch (err) {
            setError("Failed to process transcript.");
            console.error("Upload error:", err);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    };

    const renderGrades = (grades) => {
        return (
            <div className="grades-grid">
                {grades.Grades.map((grade, index) => (
                    <div key={index} className="card" onClick={() => setSelectedGrade(grade)}>
                        <div className="container-card">
                            <div className="grade-header">
                                <h4>Grade {grade["Grade Level"]} ({grade.Year})</h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderGraduationCheck = (graduationCheck) => {
        return (
            <div className="graduation-check">
                <h3>Graduation Requirements For The Student</h3>
                <ul>
                    {Object.entries(graduationCheck.requirements["Graduation Requirements"]).map(([category, count], index) => (
                        <li key={index}>{category}: {count} required</li>
                    ))}
                </ul>
                <h3>Student Progress</h3>
                <ul>
                    {Object.entries(graduationCheck.progress["Student Progress"]).map(([category, status], index) => (
                        <li key={index}>{status}</li>
                    ))}
                </ul>
                <h3>Status</h3>
                <p>{graduationCheck.met_all_requirements ? "This student is ready to graduate!" : "Please meet the requirements above!"}</p>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="background">
                <h2>Upload Transcript</h2>
                <input type="file" onChange={handleFileChange} accept=".pdf" />
                <button onClick={handleUpload} disabled={loading}>
                    {loading ? "Processing..." : "Upload"}
                </button>
                {loading && (
                    <div className="loading">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                {!loading && error && <p style={{ color: "red" }}>{error}</p>}
                {!loading && showGrades && grades && (
                    <div className="results-container">
                        <div className="grades-section">
                            <h3>Extracted Grades</h3>
                            <div className="grid">
                                {renderGrades(grades.grades)}
                            </div>
                        </div>
                        <div className="graduation-check-container">
                            <h3>Graduation Check</h3>
                            {renderGraduationCheck(grades.graduation_check)}
                        </div>
                    </div>
                )}
                {selectedGrade && (
                    <div className="popup">
                        <div className="popup-content">
                            <span className="close" onClick={() => setSelectedGrade(null)}>&times;</span>
                            <h4>Grade {selectedGrade["Grade Level"]} ({selectedGrade.Year})</h4>
                            <p>Year Average: {selectedGrade["Year Average"]}</p>
                            <h5>Term GPAs:</h5>
                            <div className="gpa-grid">
                                {selectedGrade["Term GPAs"].map((gpa, idx) => (
                                    <div key={idx}>{gpa}</div>
                                ))}
                            </div>
                            <h5>Courses:</h5>
                            <div className="course-grid">
                                {selectedGrade.Courses.map((course, idx) => (
                                    <div key={idx} className="course-item">
                                        <span className="course-name">{course.Course}:</span>
                                        <span className="course-grade">{course.Grade}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setSelectedGrade(null)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TranscriptUploader;
