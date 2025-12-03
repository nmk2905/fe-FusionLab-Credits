import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-semibold text-white">
              FusionLab Credits
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Building simple, reliable credit management tools for students and
              creators.
            </p>

            {/* Social */}
            <div className="flex items-center mt-4 space-x-3">
              <Link
                to="/"
                aria-label="GitHub"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.9.4-1.4.7-1.7-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.3-3.3-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.3 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6A12 12 0 0012 .5z" />
                </svg>
              </Link>

              <Link
                to="/"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 5.8c-.6.3-1.2.5-1.9.6.7-.4 1.2-1 1.4-1.8-.7.4-1.5.7-2.3.9C18.9 4.6 18 4 17 4c-1.8 0-3.2 1.5-3.2 3.2 0 .3 0 .6.1.9-2.6-.1-4.9-1.4-6.4-3.3-.3.6-.4 1.2-.4 1.9 0 1.3.7 2.4 1.8 3-.5 0-1-.2-1.4-.4v.1c0 1.6 1.1 3 2.6 3.3-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 1.9 2.4 3.3 4.6 3.3-1.7 1.3-3.9 2.1-6.3 2.1-.4 0-.8 0-1.2-.1 2.2 1.4 4.9 2.2 7.7 2.2 9.2 0 14.2-7.6 14.2-14.2v-.6c1-.7 1.9-1.6 2.6-2.6-.9.4-1.9.7-2.9.8z" />
                </svg>
              </Link>

              <Link
                to="/"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.5 3H3.5A.5.5 0 003 3.5v17A.5.5 0 003.5 21h17a.5.5 0 00.5-.5v-17a.5.5 0 00-.5-.5zM8 18H5.5V9H8v9zM6.7 7.7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19 18h-2.5v-4.7c0-1.1-.4-1.8-1.4-1.8-.8 0-1.2.5-1.4 1-.1.2-.1.5-.1.8V18H10.6V9H13v1.2c.3-.5.9-1.2 2.1-1.2 1.6 0 2.8 1 2.8 3.2V18z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 md:col-span-2">
            <div>
              <h4 className="text-sm font-semibold text-white">Product</h4>
              <ul className="mt-4 text-sm space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Support</h4>
              <ul className="mt-4 text-sm space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} FusionLab Credits. All rights reserved.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center space-x-2 w-full max-w-md"
          >
            <label htmlFor="footer-email" className="sr-only">
              Subscribe to newsletter
            </label>

            <input
              id="footer-email"
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
