import React from "react";

const HomeScreen = ({ setPage }) => {
    // Define animation styles
    const fadeInDown = {
        animation: "fade-in-down 1s ease-out",
    };
    const fadeInUp = {
        animation: "fade-in-up 1s ease-out",
    };
    const fadeInLeft = {
        animation: "fade-in-left 1s ease-out",
    };
    const fadeInRight = {
        animation: "fade-in-right 1s ease-out",
    };

    // Define keyframes as a style tag
    const keyframes = `
        @keyframes fade-in-down {
            0% {
                opacity: 0;
                transform: translateY(-20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fade-in-left {
            0% {
                opacity: 0;
                transform: translateX(-20px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes fade-in-right {
            0% {
                opacity: 0;
                transform: translateX(20px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;

    return (
        <div className="container mx-auto p-4">
            {/* Add keyframes as a style tag */}
            <style>{keyframes}</style>

            {/* Hero Section */}
            <div className="text-center py-20">
                <h1 className="text-5xl font-bold mb-6" style={fadeInDown}>
                    Lawrenceville Student Transcript Analysis Tool
                </h1>
                <p className="text-xl mb-8" style={fadeInUp}>
                    Efficiently analyze and manage student transcripts with ease.
                </p>
                <div className="flex justify-center gap-4" style={fadeInUp}>
                    <button
                        onClick={() => setPage("singleStudent")}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Single Student
                    </button>
                    <button
                        onClick={() => setPage("multiStudent")}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Multi Student
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16">
                <h2 className="text-3xl font-bold text-center mb-12" style={fadeInDown}>
                    Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" style={fadeInLeft}>
                        <h3 className="text-xl font-bold mb-4">📊 Transcript Analysis</h3>
                        <p>Upload and analyze individual or multiple student transcripts with ease.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" style={fadeInUp}>
                        <h3 className="text-xl font-bold mb-4">🎓 Graduation Check</h3>
                        <p>Verify if students meet graduation requirements automatically.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" style={fadeInRight}>
                        <h3 className="text-xl font-bold mb-4">📈 Performance Insights</h3>
                        <p>Gain insights into student performance and academic trends.</p>
                    </div>
                </div>
            </div>

            {/* Call-to-Action Section */}
            <div className="bg-blue-500 text-white py-16 text-center" style={fadeInUp}>
                <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                <p className="text-xl mb-8">Upload a transcript now and unlock powerful insights.</p>
                <button
                    onClick={() => setPage("singleStudent")}
                    className="bg-white text-blue-500 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Upload Transcript
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;