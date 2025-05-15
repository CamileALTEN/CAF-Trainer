// client/src/App.tsx
import React from 'react';
import {
  Routes, Route, Navigate, useLocation,
} from 'react-router-dom';

import { useAuth }          from './context/AuthContext';
import PageHeader           from './components/PageHeader';

import HomePage             from './pages/HomePage';
import ModulePage           from './pages/ModulePage';
import FavoritesPage        from './pages/FavoritesPage';
import LoginPage            from './pages/LoginPage';
import LoggedOutPage        from './pages/LoggedOutPage';

import AdminDashboardPage   from './pages/AdminDashboardPage';
import AdminModulesPage     from './pages/AdminModulesPage';
import AdminModuleEditor    from './pages/AdminModuleEditor';
import PrerequisAdminPage   from './pages/PrerequisAdminPage';

import ManagerDashboardPage from './pages/ManagerDashboardPage';
import RegisterUserPage     from './pages/RegisterUserPage';
import NotificationsPage    from './pages/NotificationsPage';

import Footer from './components/Footer';

import './App.css';

/* ------------------------------------------------------------------ */
/*  Sous‑arbre de routes selon le rôle                                 */
/* ------------------------------------------------------------------ */
function RoleRoutes() {
  const { user } = useAuth();

  /* ---------- invité ---------- */
  if (!user) {
    return (
      <Routes>
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/logged-out" element={<LoggedOutPage />} />
        <Route path="*"           element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  /* ---------- manager ---------- */
  if (user.role === 'manager') {
    return (
      <Routes>
        <Route path="/manager"                     element={<ManagerDashboardPage />} />
        <Route path="/manager/create"              element={<RegisterUserPage />} />
        <Route path="/manager/modules"             element={<AdminModulesPage />} />
        <Route path="/manager/modules/:moduleId"   element={<AdminModuleEditor />} />
        <Route path="/admin/*"                     element={<Navigate to="/manager" replace />} />
        <Route path="*"                            element={<Navigate to="/manager" replace />} />
      </Routes>
    );
  }

  /* ---------- admin ---------- */
  if (user.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin"                       element={<AdminDashboardPage />} />
        <Route path="/admin/modules"               element={<AdminModulesPage />} />
        <Route path="/admin/modules/:moduleId"     element={<AdminModuleEditor />} />
        <Route path="/admin/prerequis"             element={<PrerequisAdminPage />} />
        <Route path="/admin/notifications"         element={<NotificationsPage />} />
        <Route path="/admin/create"                element={<RegisterUserPage />} />

        <Route path="/"   element={<Navigate to="/admin" replace />} />
        <Route path="*"   element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  /* ---------- user / caf ---------- */
  return (
    <Routes>
      <Route path="/"                   element={<HomePage />} />
      <Route path="/modules/:moduleId"  element={<ModulePage />} />
      <Route path="/favoris"            element={<FavoritesPage />} />
      <Route path="*"                   element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ------------------------------------------------------------------ */
/*  Conteneur global : header masqué sur /login | /logged‑out          */
/* ------------------------------------------------------------------ */
export default function App() {
  const { pathname } = useLocation();
  const hideHeader   = pathname === '/login' || pathname === '/logged-out';

  return (
    <>
      {!hideHeader && <PageHeader />}
      <div className="main-content">
        <RoleRoutes />
      </div>
      <Footer />

    </>
  );
}