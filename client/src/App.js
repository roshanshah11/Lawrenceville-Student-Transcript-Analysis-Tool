import React, { useState, useEffect } from "react";
import TranscriptUploader from "./TranscriptUploader";
import "./App.css";

function App() {
    const [page, setPage] = useState("home");
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    useEffect(() => {
        document.body.className = darkMode ? "dark-mode" : "";
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const renderPage = () => {
        switch (page) {
            case "home":
                return (
                    <div className="content fade-in">
                        <h2>Welcome to the Transcript Parser Application</h2>
                        <p>Upload your transcript to get started and analyze your academic performance.</p>
                        <TranscriptUploader />
                    </div>
                );
            case "singleStudent":
                return <div className="content fade-in"><p>Single Student Page</p></div>;
            case "multiStudent":
                return <div className="content fade-in"><p>Multi Student Page</p></div>;
            default:
                return null;
        }
    };

    return (
        <div className="App">
            <header className={`App-header slide-down ${darkMode ? "dark-mode" : ""}`}>
                <h1>Python Final Project: By Tun and Roshan</h1>
                <div className="greeting">Hi, User!</div>
                <button onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
            </header>
            <div className="App-body">
                <nav className="App-menu slide-right">
                    <ul>
                        <li onClick={() => setPage("home")}>Home</li>
                        <li onClick={() => setPage("singleStudent")}>Single Student</li>
                        <li onClick={() => setPage("multiStudent")}>Multi Student</li>
                    </ul>
                </nav>
                <main className="App-main">
                    {renderPage()}
                </main>
            </div>
            <footer className="App-footer fade-in">
                <p>&copy; 2023 Transcript Parser. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;
