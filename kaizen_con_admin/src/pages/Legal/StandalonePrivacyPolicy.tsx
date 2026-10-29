import { Navigate, Link } from "react-router";
import { isAuthenticated } from "../../services/authService";
import PrivacyPolicyPage from "./PrivacyPolicyPage";

const logoUrl = `${import.meta.env.BASE_URL}images/logokaizecon.png`;

export default function StandalonePrivacyPolicy() {
  const isAuth = isAuthenticated();

  // If user is already authenticated, direct them into the full admin dashboard shell
  if (isAuth) {
    return <Navigate to="/privacy-policy" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-outfit p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Header Bar for Public / Guest View */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#55355E] dark:text-[#f5d8e9] hover:text-[#AA2D7B] transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Administrator Sign In</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Kaizen Con 2027 Portal
            </span>
            <img
              src={logoUrl}
              alt="Kaizen Con 2027"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Policy Content */}
        <PrivacyPolicyPage />

        {/* Bottom Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#55355E] hover:bg-[#AA2D7B] text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Return to Admin Sign In &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
