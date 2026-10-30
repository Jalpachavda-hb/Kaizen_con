import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="w-full mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs py-3 px-4 md:px-6 print:hidden">
      <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 text-center">
        <div className="flex items-center justify-center flex-wrap gap-2">
          <span>&copy; {new Date().getFullYear()} KAIZENCON  Management Portal. All Rights Reserved.</span>
        
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
