import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import InterviewerManagementPage from "./pages/InterviewerManagementPage";
import AdminCandidatesPage from "./pages/AdminCandidatesPage";
import AdminProblemsPage from "./pages/AdminProblemsPage";
import ProblemEditorPage from "./pages/ProblemEditorPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import FeedbackPage from "./pages/FeedbackPage";
import CandidateFeedbackPage from "./pages/CandidateFeedbackPage";
import InterviewerCalendarPage from "./pages/InterviewerCalendarPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import { useParams } from "react-router";

function SessionPluralRedirect() {
  const { id } = useParams();
  return <Navigate to={`/session/${id}`} replace />;
}

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const location = useLocation();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  const isAdmin = user?.publicMetadata?.role === "admin";
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect_url");

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            !isSignedIn ? (
              <HomePage />
            ) : redirectUrl ? (
              <Navigate to={redirectUrl} replace />
            ) : (
              <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}
        />

        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to={`/?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />}
        />
        <Route
          path="/sessions/:id"
          element={<SessionPluralRedirect />}
        />
        <Route
          path="/session/:id/feedback"
          element={isSignedIn ? <FeedbackPage /> : <Navigate to={`/?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />}
        />
        <Route
          path="/session/:id/feedback/candidate"
          element={isSignedIn ? <CandidateFeedbackPage /> : <Navigate to={`/?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />}
        />
        <Route
          path="/profile"
          element={isSignedIn ? <ProfilePage /> : <Navigate to={"/"} />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sessions/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <CreateSessionPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/interviewers"
          element={
            <AdminRoute>
              <AdminLayout>
                <InterviewerManagementPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCandidatesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProblemsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/new"
          element={
            <AdminRoute>
              <AdminLayout>
                <ProblemEditorPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/:id/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <ProblemEditorPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <AdminRoute>
              <AdminLayout>
                <InterviewerCalendarPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>


      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
