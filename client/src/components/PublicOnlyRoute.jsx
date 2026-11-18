import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function PublicOnlyRoute({ children = null }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Loading HackSpot...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

export default PublicOnlyRoute;
