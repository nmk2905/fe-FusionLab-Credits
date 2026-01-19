import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import HomeStudent from "../pages/student/components/HomeStudent";
import Register from "../pages/Register/Register";
import Admin from "../pages/admin/Admin";
import Student from "../pages/student/Student";
import Mentor from "../pages/Mentor/Mentor";
import FinanceOfficer from "../pages/FinanceOfficer/FinanceOfficer";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route path="/student" element={<HomeStudent />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route path="/student/*" element={<Student />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin/*" element={<Admin />} />
        </Route>

        {/* Mentor */}
        <Route element={<ProtectedRoute allowedRoles={["Mentor"]} />}>
          <Route path="/mentor/*" element={<Mentor />} />
        </Route>

        {/* Finance */}
        <Route element={<ProtectedRoute allowedRoles={["FinanceOfficer"]} />}>
          <Route path="/finance-officer/*" element={<FinanceOfficer />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
