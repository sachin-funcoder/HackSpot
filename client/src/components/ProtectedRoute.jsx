import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function ProtectedRoute({ allowedRoles = null, children = null }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
