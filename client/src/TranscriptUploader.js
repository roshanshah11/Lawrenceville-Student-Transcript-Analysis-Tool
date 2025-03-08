import React, { useState, useEffect } from "react";
import axios from "axios";

const TranscriptUploader = ({ darkMode }) => {
    // State variables
    const [file, setFile] = useState(null); // Stores the uploaded file
    const [grades, setGrades] = useState(null); // Stores extracted grades from the transcript
    const [loading, setLoading] = useState(false); // Tracks loading state during file processing
    const [error, setError] = useState(""); // Stores error messages
    const [showGrades, setShowGrades] = useState(false); // Controls visibility of the grades section
    const [selectedGrade, setSelectedGrade] = useState(null); // Stores the currently selected grade for detailed view

    // Inject CSS animations into the DOM dynamically
    useEffect(() => {
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
            .animate-bounce {
                animation: bounce 0.5s infinite;
            }
        `;
        document.head.appendChild(style); // Add the styles to the document head

        return () => {
            document.head.removeChild(style); // Clean up by removing the styles when the component unmounts
        };
    }, []);

    // Handles file input change
    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // Update the file state with the selected file
    };

    // Handles file upload and processing
    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file."); // Show error if no file is selected
            return;
        }

        setError(""); // Clear any previous errors
        setLoading(true); // Set loading state to true
        setShowGrades(false); // Hide grades section during processing

        const formData = new FormData();
        formData.append("file", file); // Append the file to the form data

        try {
            // Send the file to the backend for processing
            const response = await axios.post("http://localhost:5000/extract-grades", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setGrades(response.data); // Store the extracted grades
            setShowGrades(true); // Show the grades section
        } catch (err) {
            setError("Failed to process transcript."); // Show error if processing fails
            console.error("Upload error:", err);
        } finally {
            setTimeout(() => {
                setLoading(false); // Reset loading state after a delay
            }, 1500);
        }
    };

    // Renders the list of grades as clickable cards
    const renderGrades = (grades) => {
        return (
            <div className="grid grid-cols-2 gap-4">
                {grades.Grades.map((grade, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg shadow-md cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                            darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
                        }`}
                        onClick={() => setSelectedGrade(grade)} // Set the selected grade on click
                    >
                        <div className="text-center">
                            <h4 className="font-bold">Grade {grade["Grade Level"]} ({grade.Year})</h4>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Renders the graduation check section
    const renderGraduationCheck = (graduationCheck) => {
        return (
            <div className={`p-6 rounded-lg shadow-md transform transition-all duration-300 ${
                darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"
            }`}>
                <h3 className="text-xl font-bold mb-4">Graduation Requirements For The Student</h3>
                <ul className="space-y-2">
                    {Object.entries(graduationCheck.requirements["Graduation Requirements"]).map(([category, count], index) => (
                        <li key={index}>
                            {category}: {count} required
                        </li>
                    ))}
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-4">Student Progress</h3>
                <ul className="space-y-2">
                    {Object.entries(graduationCheck.progress["Student Progress"]).map(([category, status], index) => (
                        <li key={index}>
                            {status}
                        </li>
                    ))}
                </ul>
                <h3 className="text-xl font-bold mt-6 mb-4">Status</h3>
                <p className={`text-lg ${graduationCheck.met_all_requirements ? "text-green-600" : "text-red-600"}`}>
                    {graduationCheck.met_all_requirements ? "This student is ready to graduate!" : "Please meet the requirements above!"}
                </p>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <div className={`p-6 rounded-lg shadow-md transform transition-all duration-300 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}>
                <h2 className="text-2xl font-bold mb-4">Single Student Transcript Processing</h2>
                {/* File input */}
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transform transition-all duration-300"
                />
                {/* Upload button */}
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transform transition-all duration-300 hover:scale-105"
                >
                    {loading ? "Processing..." : "Upload"}
                </button>
                {/* Loading animation */}
                {loading && (
                    <div className="flex justify-center mt-4">
                        <div className="loading flex space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-8 bg-blue-500 animate-bounce"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Error message */}
                {!loading && error && <p className="text-red-500 mt-4">{error}</p>}
                {/* Grades and graduation check section */}
                {!loading && showGrades && grades && (
                    <div className="mt-6">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">Extracted Grades</h3>
                            {renderGrades(grades.grades)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Graduation Check</h3>
                            {renderGraduationCheck(grades.graduation_check)}
                        </div>
                    </div>
                )}
                {/* Modal for selected grade details */}
                {selectedGrade && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className={`p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in ${
                            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                        }`}>
                            <button
                                onClick={() => setSelectedGrade(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                            <h4 className="text-xl font-bold mb-4">Grade {selectedGrade["Grade Level"]} ({selectedGrade.Year})</h4>
                            <p className="mb-4">Year Average: {selectedGrade["Year Average"]}</p>
                            <h5 className="font-bold mb-2">Term GPAs:</h5>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {selectedGrade["Term GPAs"].map((gpa, idx) => (
                                    <div key={idx} className={`p-2 rounded ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                        {gpa}
                                    </div>
                                ))}
                            </div>
                            <h5 className="font-bold mb-2">Courses:</h5>
                            <div className="space-y-2">
                                {selectedGrade.Courses.map((course, idx) => (
                                    <div key={idx} className={`flex justify-between p-2 rounded ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                                        <span className="font-bold">{course.Course}:</span>
                                        <span className="italic">{course.Grade}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setSelectedGrade(null)}
                                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transform transition-all duration-300 hover:scale-105"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TranscriptUploader;