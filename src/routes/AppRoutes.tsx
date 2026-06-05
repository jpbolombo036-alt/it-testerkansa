import { Navigate, Route, Routes } from 'react-router-dom'
import ComptesPage from '../pages/comptes'
import DashboardPage from '../pages/Dashboard'
import LoginPage from '../pages/Login'
import NotFoundPage from '../pages/NotFound'
import ApplicationsPage from '../pages/Applications'
import MessagesPage from '../pages/Messages'
import ProfilPage from '../pages/Profil'
import RapportsPage from '../pages/Rapports'
import TestsPage from '../pages/Tests'
import TachesPage from '../pages/Taches'
import UsersPage from '../pages/Users'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../hooks/useAuth'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="comptes" element={<ComptesPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="taches" element={<TachesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="rapports" element={<RapportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="profil" element={<ProfilPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
