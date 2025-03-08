import React, { useState, useEffect, Suspense, lazy } from "react";
import 'tailwindcss/tailwind.css';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// Lazy load components for better performance
const HomeScreen = lazy(() => import("./HomeScreen"));
const TranscriptUploader = lazy(() => import("./TranscriptUploader"));
const MultiStudent = lazy(() => import("./MultiStudent"));

// Custom hook for dark mode
const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

    useEffect(() => {
        document.body.className = darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800";
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    return [darkMode, setDarkMode];
};

function App() {
    const [page, setPage] = useState("home");
    const [darkMode, setDarkMode] = useDarkMode();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Reusable navigation links
    const navigationLinks = [
        { name: "Home", page: "home" },
        { name: "Single Student", page: "singleStudent" },
        { name: "Multi Student", page: "multiStudent" },
    ];

    const renderPage = () => {
        switch (page) {
            case "home":
                return <HomeScreen setPage={setPage} />;
            case "singleStudent":
                return <TranscriptUploader darkMode={darkMode} />;
            case "multiStudent":
                return <MultiStudent darkMode={darkMode} />;
            default:
                return <div className="text-center">Page not found.</div>;
        }
    };

    return (
        <div className="App min-h-screen flex flex-col">
            {/* Header */}
            <header className={`bg-white dark:bg-gray-800`}>
                <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
                    <div className="flex lg:flex-1">
                        <a href="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img
                                alt=""
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto"
                            />
                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                            aria-label="Open main menu"
                        >
                            <Bars3Icon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigationLinks.map((link) => (
                            <button
                                key={link.page}
                                onClick={() => setPage(link.page)}
                                className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <div className="relative">
                            <div className="absolute -inset-5">
                                <div className="w-full h-full max-w-sm mx-auto lg:mx-0 opacity-30 blur-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-green-600"></div>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative z-10 inline-flex items-center justify-center w-full px-8 py-3 text-sm font-semibold text-white transition-all duration-200 border-2 border-transparent sm:w-auto rounded-xl font-pj hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
                                    darkMode ? "bg-gray-1000" : "bg-gray-900"
                                }`}
                                role="button"
                            >
                                {darkMode ? "Light Mode" : "Dark Mode"}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                    <div className="fixed inset-0 z-10" />
                    <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <a href="/" className="-m-1.5 p-1.5">
                                <span className="sr-only">Your Company</span>
                                <img
                                    alt=""
                                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                    className="h-8 w-auto"
                                />
                            </a>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                                aria-label="Close menu"
                            >
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigationLinks.map((link) => (
                                        <button
                                            key={link.page}
                                            onClick={() => {
                                                setPage(link.page);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            {link.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        {darkMode ? "Light Mode" : "Dark Mode"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>

            {/* Body */}
            <div className="App-body flex flex-grow mt-16">
                <main className="App-main flex-grow p-6">
                    <Suspense fallback={<div className="text-center">Loading...</div>}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>

            {/* Footer */}
            <footer className={`App-footer p-4 text-center ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"} shadow-lg transition-colors duration-200`}>
                <p>&copy; 2025 Roshan & Tun Python Final All rights reserved.</p>
            </footer>
        </div>
    );
}

export default App;