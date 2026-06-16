import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import UsersAdminPage from '../pages/Users'
import ApplicationsPage from '../pages/Applications'
import ApplicationLinksPage from '../pages/ApplicationLinks'
import ComptesPage from '../pages/comptes'
import TestsPage from '../pages/Tests'
import TachesPage from '../pages/Taches'
import MessagesPage from '../pages/Messages'
import RapportsPage from '../pages/Rapports'
import ProfilPage from '../pages/Profil'
import NotificationsPage from '../pages/Notifications'
import NotFoundPage from '../pages/NotFound'
import MainLayout from '../layouts/MainLayout'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Routes avec layout principal - accessibles à tous les connectés */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/application-links" element={<ApplicationLinksPage />} />
          <Route path="/comptes" element={<ComptesPage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/taches" element={<TachesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/rapports" element={<RapportsPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/users" element={<UsersAdminPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default AppRoutes