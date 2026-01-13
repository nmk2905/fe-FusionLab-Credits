import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import MentorLayout from "../../components/layout/MentorLayout";
import ViewProject from "./components/ManageProject/ViewProject";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import ProjectDetail from "../ProjectDetail/ProjectDetail";
import MilestoneDetail from "../ProjectDetail/components/MilestonesTab/MilestoneDetail";

const MentorPageWrapper = ({ children }) => {
  return <MentorLayout>{children}</MentorLayout>;
};
export default function Mentor() {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route
        path="view-projects"
        element={
          <MentorPageWrapper>
            <ViewProject />
          </MentorPageWrapper>
        }
      />

      <Route
        path="projectDetail/:projectId"
        element={
          <MentorPageWrapper>
            <ProjectDetail />
          </MentorPageWrapper>
        }
      />

      <Route
        path="projectDetail/:projectId/milestones/:milestoneId"
        element={
          <MentorPageWrapper>
            <MilestoneDetail />
          </MentorPageWrapper>
        }
      />
    </Routes>
  );
}
