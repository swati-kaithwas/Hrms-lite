import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const employeeAPI = {
  addEmployee: (employeeData) => api.post('/employees/', employeeData),
  getEmployees: () => api.get('/employees/'),
  updateEmployee: (employeeId, employeeData) => api.put(`/employees/${employeeId}`, employeeData),
  deleteEmployee: (employeeId) => api.delete(`/employees/${employeeId}`),
};

// Attendance APIs
export const attendanceAPI = {
  markAttendance: (attendanceData) => api.post('/attendance/', attendanceData),
  getAttendance: (employeeId) => api.get(`/attendance/${employeeId}`),
};

export default api;
