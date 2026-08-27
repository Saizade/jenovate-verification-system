import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import LoginPage from './pages/LoginPage';
import StudentRegistration from './pages/StudentRegistration';
import AdminDashboard from './pages/AdminDashboard';
import StudentsListPage from './pages/StudentsListPage';
import DataPage from './pages/DataPage';
import BatchesPage from './pages/BatchesPage';
import EmployeeSubmissionsPage from './pages/EmployeeSubmissionsPage';
import FraudReportsPage from './pages/FraudReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ManageEmployeesPage from './pages/ManageEmployeesPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0c1e3a',
                color: '#f8fafc',
                borderRadius: '10px',
                padding: '12px 18px',
                fontSize: '13px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#0c1e3a',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#0c1e3a',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            } />

            {/* Student Routes */}
            <Route path="/student/register" element={
              <PublicLayout>
                <StudentRegistration />
              </PublicLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentsListPage />} />
              <Route path="data" element={<DataPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="submissions" element={<EmployeeSubmissionsPage />} />
              <Route path="fraud-reports" element={<FraudReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="employees" element={<ManageEmployeesPage />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="submissions" element={<EmployeeSubmissionsPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
