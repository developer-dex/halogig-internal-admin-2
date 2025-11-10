import './assets/css/App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './app/store';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState, useEffect } from 'react';
// Chakra imports

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';
  const location = useLocation();

  if (!isAdminLoggedIn) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

// Auth Route Component (redirect if already logged in)
function AuthRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/default" replace />;
  }

  return children;
}

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  return (
    <Provider store={store}>
      <ChakraProvider theme={currentTheme}>
        <Routes>
          <Route 
            path="auth/*" 
            element={
              <AuthRoute>
                <AuthLayout />
              </AuthRoute>
            } 
          />
          <Route
            path="admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="rtl/*"
            element={
              <ProtectedRoute>
                <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/" 
            element={
              localStorage.getItem('isAdminLogIn') === 'true' 
                ? <Navigate to="/admin/default" replace /> 
                : <Navigate to="/auth/sign-in" replace />
            } 
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ChakraProvider>
    </Provider>
  );
}
