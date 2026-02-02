import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [searchEmployeeId, setSearchEmployeeId] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    status: 'Present'
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchAllAttendance();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee);
    } else {
      fetchAllAttendance();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchEmployees = async () => {
    // setLoading(true);
    setError(null);
    try {
      const response = await employeeAPI.getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch employees');
    } finally {
      // setLoading(false);
    }
  };

  const fetchAllAttendance = async () => {
      console.log('All attendance records:');

    setLoading(true);
    setError(null);
    try {
      const response = await employeeAPI.getEmployees();
      const allRecords = [];
      for (const emp of (response.data || [])) {
        try {
          const attResponse = await attendanceAPI.getAttendance(emp.employee_id);
          allRecords.push(...(attResponse.data || []));
        } catch (err) {
          // Skip if unable to fetch for this employee
        }
      }
      setAttendanceRecords(allRecords);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch attendance');
      setAttendanceRecords([]);
    } finally {
      console.log('All attendance records fetched:');
      setLoading(false);
    }
  };

  const fetchAttendance = async (employeeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceAPI.getAttendance(employeeId);
      setAttendanceRecords(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch attendance');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      await attendanceAPI.markAttendance({
        employee_id: formData.employee_id,
        date: formData.date,
        status: formData.status
      });
      setSuccessMessage('Attendance marked successfully!');
      setFormData({ employee_id: '', date: '', status: 'Present' });
      
      // Reset filter and search
      setSelectedEmployee('');
      setSearchEmployeeId('');
      
      // Refresh all records
      await fetchAllAttendance();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
      // Clear the form when error occurs
      setFormData({ employee_id: '', date: '', status: 'Present' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getPresentDays = () => {
    return attendanceRecords.filter(r => r.status === 'Present').length;
  };

  const getAbsentDays = () => {
    return attendanceRecords.filter(r => r.status === 'Absent').length;
  };

  const getSelectedEmployeeName = () => {
    const emp = employees.find(e => e.employee_id === selectedEmployee);
    return emp ? emp.name : '';
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSearchByEmployeeId = () => {
    if (searchEmployeeId.trim()) {
      const emp = employees.find(e => e.employee_id.toLowerCase() === searchEmployeeId.toLowerCase());
      if (emp) {
        setSelectedEmployee(emp.employee_id);
      } else {
        setError('Employee ID not found');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchByEmployeeId();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-4">
          <h1 className="text-4xl font-bold text-gray-800">Attendance Management</h1>
        </div>

        {/* Main Layout - Left Sidebar: Mark Attendance, Right: Search/Filter/Records */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Mark Attendance Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-8 overflow-hidden z-0">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">✏️ Mark Attendance</h2>
                <p className="text-sm text-gray-500 mb-4">Quick attendance entry</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Employee *</label>
                    <select
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-poppins focus:outline-none focus:border-blue-500 truncate"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id} className="truncate">
                          {emp.name.substring(0, 15)} ({emp.employee_id.substring(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={getTodayDate()}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-poppins focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-poppins focus:outline-none focus:border-blue-500"
                    >
                      <option value="Present">✓ Present</option>
                      <option value="Absent">✗ Absent</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Marking...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Content Area - Search, Filter, and Records */}
          <div className="lg:col-span-3">
            {/* Search Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <label className="block text-xs font-semibold text-gray-700 mb-3">🔍 Search by ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={searchEmployeeId}
                  onChange={(e) => setSearchEmployeeId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-poppins focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSearchByEmployeeId}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition"
                >
                  Search
                </button>
                {selectedEmployee && (
                  <button
                    onClick={() => {
                      setSearchEmployeeId('');
                      setSelectedEmployee('');
                      fetchAllAttendance();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">{error}</div>}
            {successMessage && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">{successMessage}</div>}

            {/* Statistics */}
            {attendanceRecords.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-semibold opacity-90">Present Days</h3>
                  <p className="text-4xl font-bold mt-2">{getPresentDays()}</p>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-red-600 text-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-semibold opacity-90">Absent Days</h3>
                  <p className="text-4xl font-bold mt-2">{getAbsentDays()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-sm font-semibold opacity-90">Total Records</h3>
                  <p className="text-4xl font-bold mt-2">{attendanceRecords.length}</p>
                </div>
              </div>
            )}

            {/* Records Table */}
            <div className="bg-white p-8 rounded-lg shadow-md mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📝 Attendance Records</h2>
                  {selectedEmployee && (
                    <p className="text-gray-600 mt-1">Showing: <span className="font-semibold text-blue-600">{getSelectedEmployeeName()}</span> ({selectedEmployee})</p>
                  )}
                  {!selectedEmployee && (
                    <p className="text-gray-600 mt-1">Showing: <span className="font-semibold text-blue-600">All Employees</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Records: <span className="text-2xl font-bold text-blue-600">{attendanceRecords.length}</span></p>
                </div>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-2xl text-gray-500 mb-2">No attendance records found</p>
                  {selectedEmployee ? (
                    <p className="text-gray-400">No records for this employee yet</p>
                  ) : (
                    <p className="text-gray-400">Add employees and mark attendance to see records</p>
                  )}
                </div>
              ) : (
                <div>
                  {/* Statistics Bar */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <p className="text-green-700 text-sm font-semibold">Present</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{getPresentDays()}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-red-700 text-sm font-semibold">Absent</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{getAbsentDays()}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-700 text-sm font-semibold">Attendance Rate</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{Math.round((getPresentDays() / attendanceRecords.length) * 100)}%</p>
                    </div>
                  </div>

                  {/* Table View */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Employee</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Day</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...attendanceRecords]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((record, index) => {
                            const dateObj = new Date(record.date);
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                            const emp = employees.find(e => e.employee_id === record.employee_id);
                            return (
                              <tr key={index} className="border-b hover:bg-blue-50 transition">
                                <td className="px-6 py-4 text-gray-800 font-semibold">{emp?.name || record.employee_id}</td>
                                <td className="px-6 py-4 text-gray-800 font-semibold">{dateObj.toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-gray-600">{dayName}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 ${
                                    record.status === 'Present' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    <span>{record.status === 'Present' ? '✓' : '✗'}</span>
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;

