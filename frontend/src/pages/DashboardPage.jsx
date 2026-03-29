import { useNavigate, Navigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import {
  useActiveSessions,
  useMyRecentSessions,
} from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } =
    useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } =
    useMyRecentSessions();

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/me");
      return res.data;
    },
  });

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return (
      session.interviewer?.clerkId === user.id ||
      session.candidate?.clerkId === user.id
    );
  };

  if (!loadingProfile && profileData?.user && !profileData.user.hasCompletedProfile) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#000000] text-neutral-300 font-sans">
        <Navbar />
        <WelcomeSection />

        {/* Grid layout */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions
            sessions={recentSessions}
            isLoading={loadingRecentSessions}
          />
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
