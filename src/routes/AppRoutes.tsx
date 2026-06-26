import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import FeatureRoute from '../components/FeatureRoute'
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
import { ApplicationDetailPage } from '../components/ApplicationDetailPage'
import { AccountDetailPage } from '../components/AccountDetailPage'
import ApplicationCreatePage from '../pages/Applications/create'
import CompteCreatePage from '../pages/comptes/create'
import TestSessionCreatePage from '../pages/Tests/create'
import TestCreatePage from '../pages/Tests/TestCreatePage'
import TacheCreatePage from '../pages/Taches/create'
import ApplicationLinkCreatePage from '../pages/ApplicationLinks/create'
import ApplicationLinkEditPage from '../pages/ApplicationLinks/[id]/edit'
import UserCreatePage from '../pages/Users/create'
import BlocNotesPageWrapper from '../pages/BlocNotes'
import UserEditPage from '../pages/Users/[id]/edit'
import ApplicationEditPage from '../pages/Applications/[id]/edit'
import CompteEditPage from '../pages/comptes/[id]/edit'
import TacheEditPage from '../pages/Taches/[id]/edit'
import TestSessionEditPage from '../pages/Tests/[id]/edit'
import PresencesPage from '../pages/Presences'
import DocumentArchivePage from '../pages/DocumentArchive'
import DocumentDetailPage from '../pages/DocumentArchive/[id]'
import DocumentPreviewPage from '../pages/DocumentArchive/[id]/preview'
import DocumentUploadPage from '../pages/DocumentArchive/upload'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/applications/new" element={<ApplicationCreatePage />} />
          <Route path="/applications/:id/edit" element={<ApplicationEditPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/application-links" element={<ApplicationLinksPage />} />
          <Route path="/application-links/new" element={<ApplicationLinkCreatePage />} />
          <Route path="/application-links/:id/edit" element={<ApplicationLinkEditPage />} />
          <Route path="/comptes" element={<ComptesPage />} />
          <Route path="/comptes/new" element={<CompteCreatePage />} />
          <Route path="/comptes/:id/edit" element={<CompteEditPage />} />
          <Route path="/comptes/:id" element={<AccountDetailPage />} />
          <Route path="/tests" element={<TestsPage />} />
          <Route path="/tests/new" element={<TestSessionCreatePage />} />
          <Route path="/tests/test/new" element={<TestCreatePage />} />
          <Route path="/tests/:id/edit" element={<TestSessionEditPage />} />
          <Route path="/taches" element={<TachesPage />} />
          <Route path="/taches/new" element={<TacheCreatePage />} />
          <Route path="/taches/:id/edit" element={<TacheEditPage />} />
          <Route path="/users" element={<UsersAdminPage />} />
          <Route path="/users/new" element={<UserCreatePage />} />
          <Route path="/users/:id/edit" element={<UserEditPage />} />
          <Route path="/bloc-notes" element={<BlocNotesPageWrapper />} />
          <Route path="/bloc-notes/new" element={<BlocNotesPageWrapper />} />
          <Route path="/bloc-notes/:id" element={<BlocNotesPageWrapper />} />
          <Route path="/bloc-notes/:id/edit" element={<BlocNotesPageWrapper />} />
          <Route path="/messages" element={<MessagesPage />} />
          
          <Route path="/document-archive" element={<FeatureRoute feature="documentArchiveEnabled"><DocumentArchivePage /></FeatureRoute>} />
          <Route path="/document-archive/upload" element={<DocumentUploadPage />} />
          <Route path="/document-archive/:id" element={<DocumentDetailPage />} />
          <Route path="/document-archive/:id/preview" element={<DocumentPreviewPage />} />
          <Route path="/rapports" element={<RapportsPage />} />
          <Route path="/presences" element={<FeatureRoute feature="presencesEnabled"><PresencesPage /></FeatureRoute>} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default AppRoutes