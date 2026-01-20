// src/pages/student/student.jsx
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import StudentLayout from "../../components/layout/StudentLayout";

import HomeStudent from "../student/components/HomeStudent";
import TaskManagement from "../student/components/TaskManagement";
import MyPoints from "../student/components/MyPoints";
import GroupManagement from "../student/components/GroupManagement";
import PointExchange from "../student/components/PointExchange";
import StudentAccount from "../student/components/StudentAccount";
import ProjectDetail from "../student/components/ProjectDetail";
import MyGroupDetail from "../student/components/MyGroupDetail"; // Import it
import { AuthContext } from "../../contexts/AuthContext";
import ProjectHistory           from "../student/components/ProjectHistory";   // ← ADD THIS

const StudentPageWrapper = ({ children }) => {
  return <StudentLayout>{children}</StudentLayout>;
};

export default function Student() {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return <Loading />;
  }
  
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <StudentPageWrapper>
            <HomeStudent />
          </StudentPageWrapper>
        }
      />

      <Route
        path="task-management"
        element={
          <StudentPageWrapper>
            <TaskManagement />
          </StudentPageWrapper>
        }
      />

      <Route
        path="my-points"
        element={
          <StudentPageWrapper>
            <MyPoints />
          </StudentPageWrapper>
        }
      />

      <Route
        path="group-management"
        element={
          <StudentPageWrapper>
            <GroupManagement />
          </StudentPageWrapper>
        }
      />

      {/* NEW: My Group Detail Page */}
      <Route
        path="group-management/my-group"
        element={
          <StudentPageWrapper>
            <MyGroupDetail />
          </StudentPageWrapper>
        }
      />

      <Route
        path="point-exchange"
        element={
          <StudentPageWrapper>
            <PointExchange />
          </StudentPageWrapper>
        }
      />

      <Route
        path="account"
        element={
          <StudentPageWrapper>
            <StudentAccount />
          </StudentPageWrapper>
        }
      />

      {/* Individual project detail (for joining) */}
      <Route
        path="group-management/:projectId"
        element={
          <StudentPageWrapper>
            <ProjectDetail />
          </StudentPageWrapper>
        }
      />

      <Route
        index
        element={
          <StudentPageWrapper>
            <HomeStudent />
          </StudentPageWrapper>
        }
      />
      <Route path="group-management/history" element={<StudentPageWrapper><ProjectHistory /></StudentPageWrapper>} />
    </Routes>
  );
}
