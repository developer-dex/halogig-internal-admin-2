import { toast } from 'react-toastify';
import { clearSession } from '../config/localStorage';

export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Centralized logout function for consistency
export const adminLogout = () => {
  // Clear all session data
  clearSession();
  
  // Remove specific admin-related items
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('isAdminLogIn');
  
  // Show logout message
  showInfo('You have been logged out successfully');
  
  // Redirect to login page
  window.location.href = '/login';
};
