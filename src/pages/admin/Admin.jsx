import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import Dashboard from "./components/Dashboard";
import AccountManagement from "./components/AccountManagement";
import CreateProject from "./components/CreateProject";
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
        path="create-project"
        element={
          <AdminPageWrapper>
            <CreateProject />
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
