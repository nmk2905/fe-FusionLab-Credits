// File: student.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import StudentLayout from "../../components/layout/StudentLayout";

import HomeStudent from "../student/components/HomeStudent";
import TaskManagement from "../student/components/TaskManagement";
import MyPoints from "../student/components/MyPoints";
import GroupManagement from "../student/components/GroupManagement";
import PointExchange from "../student/components/PointExchange";
import StudentAccount from "../student/components/StudentAccount";

// Wrapper like AdminPageWrapper
const StudentPageWrapper = ({ children }) => {
  return <StudentLayout>{children}</StudentLayout>;
};

export default function Student() {
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

      <Route
        index
        element={
          <StudentPageWrapper>
            <HomeStudent />
          </StudentPageWrapper>
        }
      />
    </Routes>
  );
}
