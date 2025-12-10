import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Dashboard from "./components/Dashboard";
import AccountManagement from "./components/AccountManagement/AccountManagement";
import ProjectManagement from "./components/ProjectManagement/ProjectManagement"; // Đã thay đổi
import CreateSemester from "./components/CreateSemester";

// Tạo một wrapper component cho mỗi trang
const AdminPageWrapper = ({ children }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default function Admin() {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <AdminPageWrapper>
            <Dashboard />
          </AdminPageWrapper>
        }
      />
      <Route
        path="accounts"
        element={
          <AdminPageWrapper>
            <AccountManagement />
          </AdminPageWrapper>
        }
      />
      <Route
        path="project-management" // Đã thay đổi
        element={
          <AdminPageWrapper>
            <ProjectManagement /> {/* Đã thay đổi */}
          </AdminPageWrapper>
        }
      />
      <Route
        path="create-semester"
        element={
          <AdminPageWrapper>
            <CreateSemester />
          </AdminPageWrapper>
        }
      />
      <Route
        index
        element={
          <AdminPageWrapper>
            <Dashboard />
          </AdminPageWrapper>
        }
      />
    </Routes>
  );
}
