import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 text-gray-900 dark:text-white"
            aria-label="FusionLab Credits"
          >
            <svg
              className="w-8 h-8 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="4"
                fill="currentColor"
              />
              <path
                d="M7 12h10"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-semibold text-lg">FusionLab Credits</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
            >
              Projects
            </Link>
            <Link
              to="/credits"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
            >
              Credits
            </Link>
            <Link
              to="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600"
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Sign in
            </Link>

            <Link
              to="/get-credits"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Get Credits
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {open ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              className="block text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="block text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Projects
            </Link>
            <Link
              to="/credits"
              className="block text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Credits
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 dark:text-gray-200 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              About
            </Link>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/signin"
                className="block text-center w-full px-4 py-2 rounded-md text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
              <Link
                to="/get-credits"
                className="mt-2 block text-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Get Credits
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
