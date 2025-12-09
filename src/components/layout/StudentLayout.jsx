import React from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../Sidabar/AdminSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar />

      {/* Phần nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Có thể thêm Header nếu cần */}
        {/* <AdminHeader /> */}

        <motion.main
          className="flex-1 p-6 bg-gray-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>

        {/* Có thể thêm Footer nếu cần */}
        {/* <AdminFooter /> */}
      </div>
    </div>
  );
};

export default StudentLayout;
