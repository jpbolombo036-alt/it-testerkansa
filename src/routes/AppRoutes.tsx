import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import FeatureRoute from '../components/FeatureRoute'
import LoadingFallback from '../components/LoadingFallback'
import MainLayout from '../layouts/MainLayout'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const UsersAdminPage = lazy(() => import('../pages/Users'))
const ApplicationsPage = lazy(() => import('../pages/Applications'))
const ApplicationLinksPage = lazy(() => import('../pages/ApplicationLinks'))
const ComptesPage = lazy(() => import('../pages/comptes'))
const TestsPage = lazy(() => import('../pages/Tests'))
const TachesPage = lazy(() => import('../pages/Taches'))
const MessagesPage = lazy(() => import('../pages/Messages'))
const RapportsPage = lazy(() => import('../pages/Rapports'))
const ProfilPage = lazy(() => import('../pages/Profil'))
const NotificationsPage = lazy(() => import('../pages/Notifications'))
const NotFoundPage = lazy(() => import('../pages/NotFound'))
const ApplicationDetailPage = lazy(() => import('../components/ApplicationDetailPage').then(module => ({ default: module.ApplicationDetailPage })))
const AccountDetailPage = lazy(() => import('../components/AccountDetailPage').then(module => ({ default: module.AccountDetailPage })))
const ApplicationCreatePage = lazy(() => import('../pages/Applications/create'))
const CompteCreatePage = lazy(() => import('../pages/comptes/create'))
const TestSessionCreatePage = lazy(() => import('../pages/Tests/create'))
const TestCreatePage = lazy(() => import('../pages/Tests/TestCreatePage'))
const TacheCreatePage = lazy(() => import('../pages/Taches/create'))
const ApplicationLinkCreatePage = lazy(() => import('../pages/ApplicationLinks/create'))
const ApplicationLinkEditPage = lazy(() => import('../pages/ApplicationLinks/[id]/edit'))
const UserCreatePage = lazy(() => import('../pages/Users/create'))
const BlocNotesPageWrapper = lazy(() => import('../pages/BlocNotes'))
const UserEditPage = lazy(() => import('../pages/Users/[id]/edit'))
const ApplicationEditPage = lazy(() => import('../pages/Applications/[id]/edit'))
const CompteEditPage = lazy(() => import('../pages/comptes/[id]/edit'))
const TacheEditPage = lazy(() => import('../pages/Taches/[id]/edit'))
const TestSessionEditPage = lazy(() => import('../pages/Tests/[id]/edit'))
const PresencesPage = lazy(() => import('../pages/Presences'))
const DocumentArchivePage = lazy(() => import('../pages/DocumentArchive'))
const DocumentDetailPage = lazy(() => import('../pages/DocumentArchive/[id]'))
const DocumentPreviewPage = lazy(() => import('../pages/DocumentArchive/[id]/preview'))
const DocumentUploadPage = lazy(() => import('../pages/DocumentArchive/upload'))

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
          <Route path="/applications" element={<Suspense fallback={<LoadingFallback />}><ApplicationsPage /></Suspense>} />
          <Route path="/applications/new" element={<Suspense fallback={<LoadingFallback />}><ApplicationCreatePage /></Suspense>} />
          <Route path="/applications/:id/edit" element={<Suspense fallback={<LoadingFallback />}><ApplicationEditPage /></Suspense>} />
          <Route path="/applications/:id" element={<Suspense fallback={<LoadingFallback />}><ApplicationDetailPage /></Suspense>} />
          <Route path="/application-links" element={<Suspense fallback={<LoadingFallback />}><ApplicationLinksPage /></Suspense>} />
          <Route path="/application-links/new" element={<Suspense fallback={<LoadingFallback />}><ApplicationLinkCreatePage /></Suspense>} />
          <Route path="/application-links/:id/edit" element={<Suspense fallback={<LoadingFallback />}><ApplicationLinkEditPage /></Suspense>} />
          <Route path="/comptes" element={<Suspense fallback={<LoadingFallback />}><ComptesPage /></Suspense>} />
          <Route path="/comptes/new" element={<Suspense fallback={<LoadingFallback />}><CompteCreatePage /></Suspense>} />
          <Route path="/comptes/:id/edit" element={<Suspense fallback={<LoadingFallback />}><CompteEditPage /></Suspense>} />
          <Route path="/comptes/:id" element={<Suspense fallback={<LoadingFallback />}><AccountDetailPage /></Suspense>} />
          <Route path="/tests" element={<Suspense fallback={<LoadingFallback />}><TestsPage /></Suspense>} />
          <Route path="/tests/new" element={<Suspense fallback={<LoadingFallback />}><TestSessionCreatePage /></Suspense>} />
          <Route path="/tests/test/new" element={<Suspense fallback={<LoadingFallback />}><TestCreatePage /></Suspense>} />
          <Route path="/tests/:id/edit" element={<Suspense fallback={<LoadingFallback />}><TestSessionEditPage /></Suspense>} />
          <Route path="/taches" element={<Suspense fallback={<LoadingFallback />}><TachesPage /></Suspense>} />
          <Route path="/taches/new" element={<Suspense fallback={<LoadingFallback />}><TacheCreatePage /></Suspense>} />
          <Route path="/taches/:id/edit" element={<Suspense fallback={<LoadingFallback />}><TacheEditPage /></Suspense>} />
          <Route path="/users" element={
            <AdminRoute>
              <Suspense fallback={<LoadingFallback />}><UsersAdminPage /></Suspense>
            </AdminRoute>
          } />
          <Route path="/users/new" element={
            <AdminRoute>
              <Suspense fallback={<LoadingFallback />}><UserCreatePage /></Suspense>
            </AdminRoute>
          } />
          <Route path="/users/:id/edit" element={
            <AdminRoute>
              <Suspense fallback={<LoadingFallback />}><UserEditPage /></Suspense>
            </AdminRoute>
          } />
          <Route path="/bloc-notes" element={<Suspense fallback={<LoadingFallback />}><BlocNotesPageWrapper /></Suspense>} />
          <Route path="/bloc-notes/new" element={<Suspense fallback={<LoadingFallback />}><BlocNotesPageWrapper /></Suspense>} />
          <Route path="/bloc-notes/:id" element={<Suspense fallback={<LoadingFallback />}><BlocNotesPageWrapper /></Suspense>} />
          <Route path="/bloc-notes/:id/edit" element={<Suspense fallback={<LoadingFallback />}><BlocNotesPageWrapper /></Suspense>} />
          <Route path="/messages" element={<Suspense fallback={<LoadingFallback />}><MessagesPage /></Suspense>} />
          
          <Route path="/document-archive" element={<FeatureRoute feature="documentArchiveEnabled"><Suspense fallback={<LoadingFallback />}><DocumentArchivePage /></Suspense></FeatureRoute>} />
          <Route path="/document-archive/upload" element={<Suspense fallback={<LoadingFallback />}><DocumentUploadPage /></Suspense>} />
          <Route path="/document-archive/:id" element={<Suspense fallback={<LoadingFallback />}><DocumentDetailPage /></Suspense>} />
          <Route path="/document-archive/:id/preview" element={<Suspense fallback={<LoadingFallback />}><DocumentPreviewPage /></Suspense>} />
          <Route path="/rapports" element={<Suspense fallback={<LoadingFallback />}><RapportsPage /></Suspense>} />
          <Route path="/presences" element={
            <AdminRoute>
              <FeatureRoute feature="presencesEnabled"><Suspense fallback={<LoadingFallback />}><PresencesPage /></Suspense></FeatureRoute>
            </AdminRoute>
          } />
          <Route path="/profil" element={<Suspense fallback={<LoadingFallback />}><ProfilPage /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<LoadingFallback />}><NotificationsPage /></Suspense>} />
        </Route>
      </Route>

      <Route path="/404" element={<Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default AppRoutes