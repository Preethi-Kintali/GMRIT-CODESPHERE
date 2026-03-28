import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
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
import ProblemEditorPage from "./pages/ProblemEditorPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import FeedbackPage from "./pages/FeedbackPage";

function App() {
  const { isSignedIn, isLoaded, user } = useUser();

  // this will get rid of the flickering effect
  if (!isLoaded) return null;

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />}
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
          element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/session/:id/feedback"
          element={isSignedIn ? <FeedbackPage /> : <Navigate to={"/"} />}
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
          path="/admin/problems/new"
          element={
            <AdminRoute>
              <AdminLayout>
                <ProblemEditorPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
