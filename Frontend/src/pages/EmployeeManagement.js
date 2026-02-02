import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, employeeId: null, employeeName: '' });
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeAPI.getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch employees');
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
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let hasErrors = false;
    
    if (!formData.employee_id || !formData.employee_id.trim()) {
      newFieldErrors.employee_id = 'Employee ID is required';
      hasErrors = true;
    }
    
    if (!formData.name || !formData.name.trim()) {
      newFieldErrors.name = 'Full Name is required';
      hasErrors = true;
    } else if (formData.name.trim().length < 2) {
      newFieldErrors.name = 'Full Name must be at least 2 characters';
      hasErrors = true;
    }
    
    if (!formData.email || !formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!isValidEmail(formData.email)) {
      newFieldErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    if (!formData.department || !formData.department.trim()) {
      newFieldErrors.department = 'Department is required';
      hasErrors = true;
    }
    
    setFieldErrors(newFieldErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    setSubmitLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (editingId) {
 
        await employeeAPI.updateEmployee(editingId, formData);
        setSuccessMessage('Employee updated successfully!');
      } else {
 
        await employeeAPI.addEmployee(formData);
        setSuccessMessage('Employee added successfully!');
      }
      setFormData({ employee_id: '', name: '', email: '', department: '' });
      setFieldErrors({ employee_id: '', name: '', email: '', department: '' });
      setEditingId(null);
      setShowForm(false);
      fetchEmployees();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save employee');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.employee_id);
    setFormData(emp);
    setFieldErrors({ employee_id: '', name: '', email: '', department: '' });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ employee_id: '', name: '', email: '', department: '' });
    setFieldErrors({ employee_id: '', name: '', email: '', department: '' });
    setShowForm(false);
  };

  const handleDelete = async (employeeId) => {
    const emp = employees.find(e => e.employee_id === employeeId);
    setDeleteConfirmModal({
      show: true,
      employeeId: employeeId,
      employeeName: emp ? emp.name : ''
    });
  };

  const confirmDelete = async () => {
    try {
      await employeeAPI.deleteEmployee(deleteConfirmModal.employeeId);
      setSuccessMessage('Employee deleted successfully!');
      fetchEmployees();
      setDeleteConfirmModal({ show: false, employeeId: null, employeeName: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ show: false, employeeId: null, employeeName: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Employee Management</h1>
          <button 
            onClick={() => editingId ? handleCancelEdit() : setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:-translate-y-1"
          >
            {showForm ? 'Cancel' : '+ Add New Employee'}
          </button>
        </div>

        {/* Messages */}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500">{error}</div>}
        {successMessage && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border-l-4 border-green-500">{successMessage}</div>}

        {/* Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID {editingId && '(Read-only)'} *</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  required
                  disabled={editingId ? true : false}
                  placeholder="e.g., EMP001"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-poppins focus:outline-none transition ${fieldErrors.employee_id ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'} ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {fieldErrors.employee_id && <p className="text-red-600 text-sm mt-1">⚠️ {fieldErrors.employee_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name {editingId && '(Read-only)'} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={editingId ? true : false}
                  placeholder="e.g., John Doe"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-poppins focus:outline-none transition ${fieldErrors.name ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'} ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {fieldErrors.name && <p className="text-red-600 text-sm mt-1">⚠️ {fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address {editingId && '(Read-only)'} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={editingId ? true : false}
                  placeholder="e.g., john@example.com"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-poppins focus:outline-none transition ${fieldErrors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'} ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {fieldErrors.email && <p className="text-red-600 text-sm mt-1">⚠️ {fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., IT, HR, Finance"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-poppins focus:outline-none transition ${fieldErrors.department ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                />
                {fieldErrors.department && <p className="text-red-600 text-sm mt-1">⚠️ {fieldErrors.department}</p>}
              </div>
              <button 
                type="submit" 
                className="md:col-span-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60"
                disabled={submitLoading}
              >
                {submitLoading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Employee' : 'Add Employee')}
              </button>
            </form>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : employees.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center">
            <p className="text-2xl text-gray-500 mb-2">📭 No employees found</p>
            <p className="text-gray-400">Add your first employee to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
              <div key={emp.employee_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition z-0">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{emp.name}</h3>
                    <p className="text-sm opacity-90 truncate">{emp.employee_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp.employee_id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-blue-600 font-semibold">📧 Email:</span>
                    <p className="text-gray-700 truncate">{emp.email}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">🏢 Department:</span>
                    <p className="text-gray-700 truncate">{emp.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-5xl text-red-500 mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Employee?</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{deleteConfirmModal.employeeName}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeManagement;
