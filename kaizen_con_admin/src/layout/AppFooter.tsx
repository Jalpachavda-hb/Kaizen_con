import React from "react";
import { Link } from "react-router";
import { ShieldCheckIcon } from "../icons/conferenceIcons";

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs py-3 px-4 md:px-6 print:hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-gray-500 dark:text-gray-400">
        {/* Left Side: Copyright */}
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Kaizen Con Management Portal. All rights reserved.</span>
          <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
          <span className="hidden md:inline font-mono text-[11px] text-gray-400">v2.0</span>
        </div>

        {/* Right Side: Status & Legal Links */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Online</span>
          </div>

          <span className="text-gray-300 dark:text-gray-700">·</span>

          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-1 font-semibold text-[#55355E] dark:text-[#f5d8e9] hover:text-[#AA2D7B] dark:hover:text-white transition-colors"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </Link>

          <span className="text-gray-300 dark:text-gray-700">·</span>

          <a
            href="mailto:admin-support@kaizencon.demo"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
