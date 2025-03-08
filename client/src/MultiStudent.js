import React, { useState } from "react";
import axios from "axios";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="text-red-500">Something went wrong. Please try again later.</div>;
        }
        return this.props.children;
    }
}

const MultiStudent = ({ darkMode }) => {
    const [files, setFiles] = useState([]);
    const [processType, setProcessType] = useState("individual");
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
            setError("No files selected.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        try {
            let response;
            if (processType === "individual") {
                response = await axios.post("http://localhost:5000/upload-multi-student", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (response.status === 200) {
                    const gradResponse = await axios.get("http://localhost:5000/check-graduation");
                    setResults(gradResponse.data);
                } else {
                    setError("Failed to upload files.");
                }
            } else {
                response = await axios.post("http://localhost:5000/upload-multi-student", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (response.status === 200) {
                    const imageResponse = await axios.get("http://localhost:5000/chart", {
                        responseType: "blob",
                    });
                    const imageUrl = URL.createObjectURL(imageResponse.data);
                    setResults(imageUrl);
                } else {
                    setError("Failed to upload files.");
                }
            }
        } catch (err) {
            console.error("Error during file processing:", err);
            setError(err.response?.data?.error || "An error occurred while processing files");
        } finally {
            setLoading(false);
        }
    };

    const toggleCard = (filename) => {
        setExpandedCards((prevState) => ({
            ...prevState,
            [filename]: !prevState[filename],
        }));
    };

    const renderResults = () => {
        if (!results) return null;

        if (processType === "individual") {
            return (
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Individual Results</h3>
                    {Object.entries(results).map(([filename, data]) => {
                        const parts = filename.split("_");
                        const isExpanded = expandedCards[filename];
                        const isDataAvailable = data?.graduation_check?.met_all_requirements !== undefined;

                        return (
                            <div
                                key={filename}
                                className={`p-4 rounded-lg shadow-md mb-4 cursor-pointer ${
                                    darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
                                } ${isDataAvailable ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                                onClick={() => isDataAvailable && toggleCard(filename)}
                            >
                                <h4 className="font-bold">{parts}</h4>
                                <div className="mt-2">
                                    <strong>Graduation Status:</strong>{" "}
                                    {data?.graduation_check?.met_all_requirements !== undefined ? (
                                        data.graduation_check.met_all_requirements ? (
                                            <span className="text-green-600">✅ All Requirements Met</span>
                                        ) : (
                                            <span className="text-red-600">❌ Some Requirements Not Met</span>
                                        )
                                    ) : (
                                        <span className="text-gray-500">⚠️ Data Unavailable</span>
                                    )}
                                </div>

                                {isExpanded && isDataAvailable && (
                                    <div className="mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="font-bold mb-2">Progress</h5>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-2">Requirement</th>
                                                            <th className="px-4 py-2">Status</th>
                                                            <th className="px-4 py-2">Progress</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(data.graduation_check.progress["Student Progress"]).map(([req, status]) => {
                                                            const isMet = status.includes("✅");
                                                            const progressText = status.split(":")[1].trim();
                                                            return (
                                                                <tr key={req} className={isMet ? "bg-green-100" : "bg-red-100"}>
                                                                    <td className="border px-4 py-2">{req}</td>
                                                                    <td className="border px-4 py-2">{isMet ? "✅ Met" : "❌ Not Met"}</td>
                                                                    <td className="border px-4 py-2">{progressText}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div>
                                                <h5 className="font-bold mb-2">Graduation Requirements</h5>
                                                <table className="w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-2">Requirement</th>
                                                            <th className="px-4 py-2">Credits Needed</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(data.graduation_check.requirements["Graduation Requirements"]).map(([req, credits]) => (
                                                            <tr key={req}>
                                                                <td className="border px-4 py-2">{req}</td>
                                                                <td className="border px-4 py-2">{credits}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
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
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Collective Analysis</h3>
                    {results ? (
                        <img src={results} alt="Visual representation of the collective analysis results" className="w-full rounded-lg shadow-md" />
                    ) : (
                        <p>No data available.</p>
                    )}
                </div>
            );
        }
    };

    return (
        <ErrorBoundary>
            <div className="container mx-auto p-4">
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                    <h2 className="text-2xl font-bold mb-4">Multi-Student Transcript Processing</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="transcript-files" className="block text-sm font-medium text-gray-700">
                                Select Transcript Folder:
                            </label>
                            <input
                                type="file"
                                id="transcript-files"
                                webkitdirectory="true"
                                directory="true"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="individual"
                                    checked={processType === "individual"}
                                    onChange={handleProcessTypeChange}
                                />
                                Process Individually
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value="collective"
                                    checked={processType === "collective"}
                                    onChange={handleProcessTypeChange}
                                />
                                Process Collectively
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={files.length === 0 || loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        >
                            {loading ? "Processing..." : "Process Files"}
                        </button>
                    </form>
                    {error && <div className="text-red-500 mt-4">{error}</div>}
                    {renderResults()}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default MultiStudent;