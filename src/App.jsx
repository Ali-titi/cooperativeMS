// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MemberDashboard from './components/member/MemberDashboard';
//import PresidentDashboard from './components/president/PresidentDashboard';
//import AccountantDashboard from './components/accountant/AccountantDashboard';
import Home from './pages/Homes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Routes>
            <Route path="/" element={<Homes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/member/*"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/president/*"
              element={
                <ProtectedRoute allowedRoles={['president']}>
                  <PresidentDashboard />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/accountant/*"
              element={
                <ProtectedRoute allowedRoles={['accountant']}>
                  <AccountantDashboard />
                </ProtectedRoute>
              }
            /> */}
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 1000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;