import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  // Check admin role in public metadata
  const role = user?.publicMetadata?.role;
  if (role !== "admin") {
    // If they somehow land here and aren't admin, send them to normal dashboard
    return <Navigate to="/dashboard" />;
  }

  return children;
}
