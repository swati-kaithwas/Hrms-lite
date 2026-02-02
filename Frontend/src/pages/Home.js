import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI, attendanceAPI } from '../services/api';

function Home() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    recentEmployees: [],
    departmentDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all employees
      const employeesRes = await employeeAPI.getEmployees();
      const employees = employeesRes.data || [];

      // Calculate total employees
      const totalEmployees = employees.length;

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch attendance for all employees to get today's stats
      let presentToday = 0;
      let absentToday = 0;

      for (const emp of employees) {
        try {
          const attendanceRes = await attendanceAPI.getAttendance(emp.employee_id);
          const todayRecord = attendanceRes.data.find(
            record => new Date(record.date).toISOString().split('T')[0] === today
          );
          if (todayRecord) {
            if (todayRecord.status === 'Present') {
              presentToday++;
            } else {
              absentToday++;
            }
          }
        } catch (err) {
          // Skip if attendance fetch fails for an employee
        }
      }

      // Get recent employees (last 5)
      const recentEmployees = employees.slice(-5).reverse();

      // Count department distribution
      const departmentDistribution = {};
      employees.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
      });

      setStats({
        totalEmployees,
        presentToday,
        absentToday,
        recentEmployees,
        departmentDistribution
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">HRMS Lite</h1>
          <p className="text-2xl mb-2">Employee & Attendance Management System</p>
          <p className="text-lg opacity-95">Manage your team efficiently with our simple and powerful HR tool</p>
        </div>

        {/* Skeleton Loaders */}
        <div className="max-w-6xl mx-auto px-8 -mt-12 mb-16">
          {/* Skeleton Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Recently Added & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-2 bg-gray-50 rounded">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">HRMS Lite</h1>
        <p className="text-2xl mb-2">Employee & Attendance Management System</p>
        <p className="text-lg opacity-95">Manage your team efficiently with our simple and powerful HR tool</p>
      </div>

      {/* Error Message */}
      {error && <div className="max-w-6xl mx-auto px-8 mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Dashboard Overview - Compact Stats with Circular Progress */}
      <div className="max-w-6xl mx-auto px-8 -mt-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Circular Progress - Total Employees */}
          <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#667eea" 
                    strokeWidth="6" 
                    strokeDasharray={`${stats.totalEmployees * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Total Employees</p>
            </div>
          </div>

          {/* Circular Progress - Present Today */}
          <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="6" 
                    strokeDasharray={`${(stats.presentToday / (stats.presentToday + stats.absentToday || 1)) * 283} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">{stats.presentToday}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Present</p>
            </div>
          </div>

          {/* Circular Progress - Absent Today */}
          <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="6" 
                    strokeDasharray={`${(stats.absentToday / (stats.presentToday + stats.absentToday || 1)) * 283} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">{stats.absentToday}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Absent</p>
            </div>
          </div>

          {/* Circular Progress - Attendance Rate */}
          <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#0891B2" 
                    strokeWidth="6" 
                    strokeDasharray={`${(stats.presentToday / (stats.presentToday + stats.absentToday || 1)) * 283} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-cyan-600">{stats.totalEmployees > 0 ? Math.round((stats.presentToday / (stats.presentToday + stats.absentToday || 1)) * 100) : 0}%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700 text-center">Attendance Rate</p>
            </div>
          </div>
        </div>

        {/* Recently Added Employees & Department Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Recently Added Employees */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">Recent Employees</h3>
              <Link to="/employees" className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-700 text-white text-xs font-semibold rounded hover:bg-blue-700">
                View All
              </Link>
            </div>
            {stats.recentEmployees.length === 0 ? (
              <p className="text-gray-500 text-sm">No employees added yet</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.recentEmployees.map(emp => (
                  <div key={emp.employee_id} className="flex justify-between items-center p-2 bg-gray-50 rounded border-l-2 border-blue-500 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{emp.name}</p>
                      <p className="text-xs text-gray-600 truncate">{emp.employee_id}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded ml-2 truncate">
                      {emp.department || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Distribution */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Department Distribution</h3>
            {Object.keys(stats.departmentDistribution).length === 0 ? (
              <p className="text-gray-500 text-sm">No department data available</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(stats.departmentDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([dept, count]) => (
                    <div key={dept} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{dept}</span>
                        <span className="text-xs font-bold text-cyan-600">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-700 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.totalEmployees) * 100 || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Employee Management</h3>
            <p className="text-gray-600 mb-4">Add, view, and manage employee records with ease. Keep all employee information organized in one place.</p>
            <Link to="/employees" className="text-blue-600 font-semibold hover:text-cyan-700">
              Manage Employees →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Attendance Tracking</h3>
            <p className="text-gray-600 mb-4">Mark and track employee attendance. Get insights into present and absent days at a glance.</p>
            <Link to="/attendance" className="text-blue-600 font-semibold hover:text-cyan-700">
              Track Attendance →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Quick Analytics</h3>
            <p className="text-gray-600 mb-4">View attendance statistics and employee details in one centralized dashboard.</p>
            <Link to="/employees" className="text-blue-600 font-semibold hover:text-cyan-700">
              View Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Get Started Today</h2>
        <p className="text-gray-600 mb-8 text-lg">HRMS Lite makes employee and attendance management simple and straightforward.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/employees" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition">
            Manage Employees
          </Link>
          <Link to="/attendance" className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
            Mark Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
