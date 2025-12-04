import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Optional: nicer icons

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // To detect current route

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/credits", label: "Credits" },
    { to: "/about", label: "About" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              FusionLab <span className="text-orange-600">Credits</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-1 py-2 text-sm font-medium transition-colors duration-300
                  ${isActive(link.to)
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-600"
                  }`}
              >
                {link.label}
                {/* Animated underline */}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-full transform origin-left scale-x-100 transition-transform duration-300"></span>
                )}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-full transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Sign in
            </Link>
            <Link
              to="/get-credits"
              className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Get Credits
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slide Down Animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-3 px-4 rounded-lg text-lg font-medium transition-all ${
                isActive(link.to)
                  ? "bg-orange-100 text-orange-600 font-bold"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {link.label}
              {isActive(link.to) && " ← Current"}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center py-3 text-orange-600 font-semibold hover:bg-orange-50 rounded-lg"
            >
              Sign in
            </Link>
            <Link
              to="/get-credits"
              onClick={() => setOpen(false)}
              className="block text-center py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transform hover:scale-105 transition shadow-lg"
            >
              Get Credits
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;