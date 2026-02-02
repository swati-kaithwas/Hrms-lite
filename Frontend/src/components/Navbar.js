import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="sticky top-0 z-100 bg-gradient-to-r from-indigo-500 to-purple-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold no-underline">
          <span className="text-4xl">👔</span>
          HRMS Lite
        </Link>
        <div className="flex gap-8">
            <Link to="/" className="text-white font-medium hover:opacity-80 transition-opacity">
           Dashboard
          </Link>
          <Link to="/employees" className="text-white font-medium hover:opacity-80 transition-opacity">
            Employees
          </Link>
          <Link to="/attendance" className="text-white font-medium hover:opacity-80 transition-opacity">
            Attendance
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
