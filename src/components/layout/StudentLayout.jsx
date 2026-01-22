import React from "react";
import { motion } from "framer-motion";
import StudentSidebar from "../../components/Sidabar/StudentSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Sidebar - fixed on large screens, or top on mobile if you want */}
      <div className="md:w-72 md:flex-shrink-0 md:overflow-y-auto md:border-r border-gray-200">
        <StudentSidebar />
      </div>

      {/* Main content area - this is the only scrollable part */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <motion.main
            className="p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;