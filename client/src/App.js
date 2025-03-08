import React, { useState, useEffect } from "react";
import TranscriptUploader from "./TranscriptUploader";
import MultiStudent from "./MultiStudent";
import 'tailwindcss/tailwind.css';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function App() {
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const renderPage = () => {
    switch (page) {
        case "home":
            return <div className="content p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in"><p>Home Page</p></div>;
        case "singleStudent":
            return (
                <div className="content p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to the Transcript Parser Application</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Upload your transcript to get started and analyze your academic performance.</p>
                <TranscriptUploader />
                </div>
            );
        case "multiStudent":
            return <div className="content p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in"><MultiStudent /></div>;
        default:
            return null;
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
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDbqZLGKxJncoDyX9TUTk5VB7NWCBzVu8T9Q&s0"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <button
              onClick={() => setPage("home")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </button>
            <button
              onClick={() => setPage("singleStudent")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Single Student
            </button>
            <button
              onClick={() => setPage("multiStudent")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Multi Student
            </button>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </nav>
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
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <button
                    onClick={() => {
                      setPage("home");
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      setPage("singleStudent");
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Single Student
                  </button>
                  <button
                    onClick={() => {
                      setPage("multiStudent");
                      setMobileMenuOpen(false);
                    }}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Multi Student
                  </button>
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
        {/* Main Content */}
        <main className="App-main flex-grow p-6">
          {renderPage()}
        </main>
      </div>

      {/* Footer */}
      <footer className={`App-footer p-4 text-center ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"} shadow-lg`}>
        <p>&copy; 2023 Transcript Parser. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;