import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/Loading/Loading";
import FinanceLayout from "../../components/layout/FinanceLayout";
import CreateRewards from "./components/CreateRewards";
import ViewRewards from "./components/ViewRewards";

const FinanceOfficerPageWrapper = ({ children }) => {
  return <FinanceLayout>{children}</FinanceLayout>;
};
export default function FinanceOfficer() {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route
        path="view-rewards"
        element={
          <FinanceOfficerPageWrapper>
            <ViewRewards />
          </FinanceOfficerPageWrapper>
        }
      />
      <Route
        path="create-rewards"
        element={
          <FinanceOfficerPageWrapper>
            <CreateRewards />
          </FinanceOfficerPageWrapper>
        }
      />
    </Routes>
  );
}
