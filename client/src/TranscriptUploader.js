import React, { useState } from "react";
import axios from "axios";

const TranscriptUploader = ({ darkMode }) => {
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
            const response = await axios.post("http://localhost:5000/extract-grades", formData, {
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
            <div className="grid grid-cols-2 gap-4">
                {grades.Grades.map((grade, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform ${
                            darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
                        }`}
                        onClick={() => setSelectedGrade(grade)}
                    >
                        <div className="text-center">
                            <h4 className="font-bold">Grade {grade["Grade Level"]} ({grade.Year})</h4>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderGraduationCheck = (graduationCheck) => {
        return (
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"}`}>
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
            <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                <h2 className="text-2xl font-bold mb-4">Single Student Transcript Processing</h2>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? "Processing..." : "Upload"}
                </button>
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
                {!loading && error && <p className="text-red-500 mt-4">{error}</p>}
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
                {selectedGrade && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className={`p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto ${
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
                                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
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