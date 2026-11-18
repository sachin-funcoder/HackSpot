import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import PublicOnlyRoute from '../components/PublicOnlyRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AdminHackathonPage from '../pages/AdminHackathonPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import HackathonDetailsPage from '../pages/HackathonDetailsPage.jsx';
import HackathonListingPage from '../pages/HackathonListingPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hackathons" element={<HackathonListingPage />} />
        <Route path="/hackathons/:slug" element={<HackathonDetailsPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/hackathons" element={<AdminHackathonPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
